import { WlBuffer } from "./objects/wl_buffer";
import { WlCallback } from "./objects/wl_callback";
import { WlCompositor } from "./objects/wl_compositor";
import { WlDataDevice } from "./objects/wl_data_device";
import { WlDataDeviceManager } from "./objects/wl_data_device_manager";
import { WlDataOffer } from "./objects/wl_data_offer";
import { WlDisplay } from "./objects/wl_display";
import { WlKeyboard } from "./objects/wl_keyboard";
import { WlOutput } from "./objects/wl_output";
import { WlPointer } from "./objects/wl_pointer";
import { WlRegion } from "./objects/wl_region";
import { WlRegistry } from "./objects/wl_registry";
import { WlSeat } from "./objects/wl_seat";
import { WlShm } from "./objects/wl_shm";
import { WlShmPool } from "./objects/wl_shm_pool";
import { WlSubcompositor } from "./objects/wl_subcompositor";
import { WlSubsurface } from "./objects/wl_subsurface";
import { WlSurface } from "./objects/wl_surface";
import { XdgPopup } from "./objects/xdg_popup";
import { XdgPositioner } from "./objects/xdg_positioner";
import { XdgSurface } from "./objects/xdg_surface";
import { XdgToplevel } from "./objects/xdg_toplevel";
import { XdgWmBase } from "./objects/xdg_wm_base";
import { ZxdgDecorationManagerV1, ZxdgToplevelDecorationV1 } from "./objects/zxdg_decoration_manager_v1";

export const newIdMap = {
  wl_buffer: WlBuffer,
  wl_display: WlDisplay,
  wl_pointer: WlPointer,
  wl_keyboard: WlKeyboard,
  wl_registry: WlRegistry,
  wl_callback: WlCallback,
  wl_compositor: WlCompositor,
  wl_shm: WlShm,
  wl_shm_pool: WlShmPool,
  wl_seat: WlSeat,
  wl_subcompositor: WlSubcompositor,
  wl_output: WlOutput,
  xdg_wm_base: XdgWmBase,
  wl_data_device_manager: WlDataDeviceManager,
  wl_data_device: WlDataDevice,
  wl_data_offer: WlDataOffer,
  wl_surface: WlSurface,
  wl_subsurface: WlSubsurface,
  xdg_positioner: XdgPositioner,
  xdg_popup: XdgPopup,
  xdg_surface: XdgSurface,
  xdg_toplevel: XdgToplevel,
  wl_region: WlRegion,
  zxdg_decoration_manager_v1: ZxdgDecorationManagerV1,
  zxdg_toplevel_decoration_v1: ZxdgToplevelDecorationV1,
} as const;
