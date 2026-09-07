import { BaseObject } from './base_object.js';
import { interfaces, type NewObjectDescriptor } from '@cathodique/wl-serv-low';
import { WlSurface } from './wl_surface.js';
import { openSync, writeSync, unlinkSync } from 'node:fs';

// Linux DRM Format definitions (FourCC codes from drm_fourcc.h)
export const DRM_FORMAT_ARGB8888 = 0x34325241;
export const DRM_FORMAT_XRGB8888 = 0x34325258;
export const DRM_FORMAT_ABGR8888 = 0x34324241;
export const DRM_FORMAT_XBGR8888 = 0x34324258;
export const DRM_FORMAT_RGBA8888 = 0x34324152;
export const DRM_FORMAT_RGBX8888 = 0x34325852;
export const DRM_FORMAT_BGRA8888 = 0x34324142;
export const DRM_FORMAT_BGRX8888 = 0x34325842;
export const DRM_FORMAT_NV12 = 0x3231564e;
export const DRM_FORMAT_NV16 = 0x3631564e;

export const DRM_FORMAT_MOD_LINEAR = 0n;
export const DRM_FORMAT_MOD_INVALID = 0x00ffffffffffffffn;

const SUPPORTED_DRM_FORMATS = [
  DRM_FORMAT_ARGB8888,
  DRM_FORMAT_XRGB8888,
  DRM_FORMAT_ABGR8888,
  DRM_FORMAT_XBGR8888,
  DRM_FORMAT_RGBA8888,
  DRM_FORMAT_RGBX8888,
  DRM_FORMAT_BGRA8888,
  DRM_FORMAT_BGRX8888,
  DRM_FORMAT_NV12,
  DRM_FORMAT_NV16,
];

let cachedFormatTable: { fd: number; size: number; numEntries: number } | null = null;
let formatTableCounter = 0;

function getOrCreateFormatTable(): { fd: number; size: number; numEntries: number } {
  if (cachedFormatTable) return cachedFormatTable;

  const entries: Array<{ format: number; modifier: bigint }> = [];
  for (const fmt of SUPPORTED_DRM_FORMATS) {
    entries.push({ format: fmt, modifier: DRM_FORMAT_MOD_LINEAR });
    entries.push({ format: fmt, modifier: DRM_FORMAT_MOD_INVALID });
  }

  const numEntries = entries.length;
  const size = numEntries * 16;
  const tableBuffer = Buffer.alloc(size);

  for (let i = 0; i < numEntries; i++) {
    const { format, modifier } = entries[i];
    const offset = i * 16;
    if (process.arch === 'arm64' || process.arch === 'x64' || process.arch === 'ia32') {
      tableBuffer.writeUInt32LE(format, offset);
      tableBuffer.writeUInt32LE(0, offset + 4);
      tableBuffer.writeBigUInt64LE(modifier, offset + 8);
    } else {
      tableBuffer.writeUInt32BE(format, offset);
      tableBuffer.writeUInt32BE(0, offset + 4);
      tableBuffer.writeBigUInt64BE(modifier, offset + 8);
    }
  }

  const tmpPath = `/dev/shm/cathodique-dmabuf-table-${process.pid}-${++formatTableCounter}`;
  const fd = openSync(tmpPath, 'w+');
  try {
    unlinkSync(tmpPath);
  } catch {}
  writeSync(fd, tableBuffer, 0, size, 0);

  cachedFormatTable = { fd, size, numEntries };
  return cachedFormatTable;
}

export interface DmabufPlaneDescriptor {
  fd: number;
  planeIdx: number;
  offset: number;
  stride: number;
  modifierHi: number;
  modifierLo: number;
  modifier: bigint;
}

export interface DmabufBufferMetadata {
  planes: DmabufPlaneDescriptor[];
  width: number;
  height: number;
  format: number;
  flags: number;
}

export class DmabufBuffer extends BaseObject {
  parent: ZwpLinuxBufferParamsV1;
  surface?: WlSurface;
  meta: DmabufBufferMetadata;
  videoFrame?: any;
  importedSharedTexture?: any;
  pendingRelease?: () => void;

  constructor(initCtx: NewObjectDescriptor, meta: DmabufBufferMetadata) {
    super(initCtx);
    this.parent = initCtx.parent as ZwpLinuxBufferParamsV1;
    this.parent.daughterBuffers.add(this);
    this.meta = meta;
  }

  get isDmabuf(): true {
    return true;
  }

  get width() {
    return this.meta.width;
  }

  get height() {
    return this.meta.height;
  }

  release(): void {
    if (this.pendingRelease) {
      const fn = this.pendingRelease;
      this.pendingRelease = undefined;
      fn();
    }
  }

  wlDestroy() {
    if (this.videoFrame && typeof this.videoFrame.close === 'function') {
      this.videoFrame.close();
      this.videoFrame = undefined;
    }
    if (this.importedSharedTexture && typeof this.importedSharedTexture.release === 'function') {
      this.importedSharedTexture.release();
      this.importedSharedTexture = undefined;
    }
    this.parent.daughterBuffers.delete(this);
    super.wlDestroy();
    this.parent.cleanupIfEligible();
  }
}

export class ZwpLinuxDmabufV1 extends BaseObject {
  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);

    const ifaceVer = this._version ?? interfaces.zwp_linux_dmabuf_v1.version;

    for (const format of SUPPORTED_DRM_FORMATS) {
      if (ifaceVer < 4) {
        this.addCommand('format', { format });
      }

      if (ifaceVer >= 3) {
        this.addCommand('modifier', {
          format,
          modifierHi: 0,
          modifierLo: 0,
        });
      }
    }
  }

  wlCreateParams(args: { paramsId: NewObjectDescriptor }) {
    this.connection.createObject(new ZwpLinuxBufferParamsV1(args.paramsId));
  }

  wlGetDefaultFeedback(args: { id: NewObjectDescriptor }) {
    this.connection.createObject(new ZwpLinuxDmabufFeedbackV1(args.id));
  }

  wlGetSurfaceFeedback(args: { id: NewObjectDescriptor; surface: BaseObject }) {
    this.connection.createObject(new ZwpLinuxDmabufFeedbackV1(args.id, args.surface));
  }
}

export class ZwpLinuxBufferParamsV1 extends BaseObject {
  planes: Map<number, DmabufPlaneDescriptor> = new Map();
  daughterBuffers: Set<DmabufBuffer> = new Set();
  isUsed: boolean = false;

  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);
  }

  wlAdd(args: {
    fd: number;
    planeIdx: number;
    offset: number;
    stride: number;
    modifierHi: number;
    modifierLo: number;
  }) {
    if (this.isUsed) {
      return this.raiseError('already_used', 'Buffer params already used to create buffer');
    }
    if (args.planeIdx >= 4) {
      return this.raiseError('plane_idx', `Plane index ${args.planeIdx} out of bounds`);
    }
    if (this.planes.has(args.planeIdx)) {
      return this.raiseError('plane_set', `Plane index ${args.planeIdx} already set`);
    }

    const modifierHi = args.modifierHi >>> 0;
    const modifierLo = args.modifierLo >>> 0;
    const modifier = (BigInt(modifierHi) << 32n) | BigInt(modifierLo);

    this.planes.set(args.planeIdx, {
      fd: args.fd,
      planeIdx: args.planeIdx,
      offset: args.offset,
      stride: args.stride,
      modifierHi,
      modifierLo,
      modifier,
    });
  }

  private validateParams(width: number, height: number, _format: number): boolean {
    if (width <= 0 || height <= 0) {
      this.raiseError('invalid_dimensions', `Invalid buffer dimensions: ${width}x${height}`);
      return false;
    }
    if (this.planes.size === 0) {
      this.raiseError('incomplete', 'No planes added to buffer params');
      return false;
    }
    return true;
  }

  private collectPlanes(): DmabufPlaneDescriptor[] {
    return Array.from(this.planes.values()).sort((a, b) => a.planeIdx - b.planeIdx);
  }

  wlCreate(args: { width: number; height: number; format: number; flags: number }) {
    if (this.isUsed) {
      return this.raiseError('already_used', 'Buffer params already used');
    }
    this.isUsed = true;

    if (!this.validateParams(args.width, args.height, args.format)) {
      this.addCommand('failed', {});
      this.connection.sendPending();
      return;
    }

    const planes = this.collectPlanes();
    const serverOid = this.connection.createServerOid();
    const dmabufBuffer = new DmabufBuffer(
      {
        oid: serverOid,
        type: 'wl_buffer',
        parent: this,
        connection: this.connection,
      },
      {
        planes,
        width: args.width,
        height: args.height,
        format: args.format,
        flags: args.flags,
      }
    );

    this.connection.createObject(dmabufBuffer);
    this.addCommand('created', { buffer: dmabufBuffer });
    this.connection.sendPending();
  }

  wlCreateImmed(args: {
    bufferId: NewObjectDescriptor;
    width: number;
    height: number;
    format: number;
    flags: number;
  }) {
    if (this.isUsed) {
      return this.raiseError('already_used', 'Buffer params already used');
    }
    this.isUsed = true;

    if (!this.validateParams(args.width, args.height, args.format)) {
      return;
    }

    const planes = this.collectPlanes();
    const dmabufBuffer = new DmabufBuffer(args.bufferId, {
      planes,
      width: args.width,
      height: args.height,
      format: args.format,
      flags: args.flags,
    });

    this.connection.createObject(dmabufBuffer);
  }

  cleanupIfEligible() {}

  wlDestroy() {
    super.wlDestroy();
  }
}

export class ZwpLinuxDmabufFeedbackV1 extends BaseObject {
  targetSurface?: BaseObject;

  constructor(initCtx: NewObjectDescriptor, surface?: BaseObject) {
    super(initCtx);
    this.targetSurface = surface;
    this.sendFeedback();
  }

  private sendFeedback() {
    const table = getOrCreateFormatTable();
    this.addCommand('formatTable', {
      fd: table.fd,
      size: table.size,
    });

    const devBuf = Buffer.alloc(8);
    devBuf.writeUInt32LE(0, 0);
    devBuf.writeUInt32LE(0, 4);
    this.addCommand('mainDevice', {
      device: devBuf,
    });

    const indices: number[] = [];
    for (let i = 0; i < table.numEntries; i++) {
      indices.push(i);
    }
    const indicesBuf = Buffer.alloc(indices.length * 2);
    for (let i = 0; i < indices.length; i++) {
      indicesBuf.writeUInt16LE(indices[i], i * 2);
    }

    this.addCommand('trancheTargetDevice', { device: devBuf });
    this.addCommand('trancheFlags', { flags: 1 });
    this.addCommand('trancheFormats', { indices: indicesBuf });
    this.addCommand('trancheDone', {});
    this.addCommand('done', {});
    this.connection.sendPending();
  }

  wlDestroy() {
    super.wlDestroy();
  }
}
