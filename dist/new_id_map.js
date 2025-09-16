"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newIdMap = void 0;
const wl_buffer_1 = require("./objects/wl_buffer");
const wl_callback_1 = require("./objects/wl_callback");
const wl_compositor_1 = require("./objects/wl_compositor");
const wl_data_device_1 = require("./objects/wl_data_device");
const wl_data_device_manager_1 = require("./objects/wl_data_device_manager");
const wl_data_offer_1 = require("./objects/wl_data_offer");
const wl_display_1 = require("./objects/wl_display");
const wl_keyboard_1 = require("./objects/wl_keyboard");
const wl_output_1 = require("./objects/wl_output");
const wl_pointer_1 = require("./objects/wl_pointer");
const wl_region_1 = require("./objects/wl_region");
const wl_registry_1 = require("./objects/wl_registry");
const wl_seat_1 = require("./objects/wl_seat");
const wl_shm_1 = require("./objects/wl_shm");
const wl_shm_pool_1 = require("./objects/wl_shm_pool");
const wl_subcompositor_1 = require("./objects/wl_subcompositor");
const wl_subsurface_1 = require("./objects/wl_subsurface");
const wl_surface_1 = require("./objects/wl_surface");
const xdg_popup_1 = require("./objects/xdg_popup");
const xdg_positioner_1 = require("./objects/xdg_positioner");
const xdg_surface_1 = require("./objects/xdg_surface");
const xdg_toplevel_1 = require("./objects/xdg_toplevel");
const xdg_wm_base_1 = require("./objects/xdg_wm_base");
const zxdg_decoration_manager_v1_1 = require("./objects/zxdg_decoration_manager_v1");
exports.newIdMap = {
    wl_buffer: wl_buffer_1.WlBuffer,
    wl_display: wl_display_1.WlDisplay,
    wl_pointer: wl_pointer_1.WlPointer,
    wl_keyboard: wl_keyboard_1.WlKeyboard,
    wl_registry: wl_registry_1.WlRegistry,
    wl_callback: wl_callback_1.WlCallback,
    wl_compositor: wl_compositor_1.WlCompositor,
    wl_shm: wl_shm_1.WlShm,
    wl_shm_pool: wl_shm_pool_1.WlShmPool,
    wl_seat: wl_seat_1.WlSeat,
    wl_subcompositor: wl_subcompositor_1.WlSubcompositor,
    wl_output: wl_output_1.WlOutput,
    xdg_wm_base: xdg_wm_base_1.XdgWmBase,
    wl_data_device_manager: wl_data_device_manager_1.WlDataDeviceManager,
    wl_data_device: wl_data_device_1.WlDataDevice,
    wl_data_offer: wl_data_offer_1.WlDataOffer,
    wl_surface: wl_surface_1.WlSurface,
    wl_subsurface: wl_subsurface_1.WlSubsurface,
    xdg_positioner: xdg_positioner_1.XdgPositioner,
    xdg_popup: xdg_popup_1.XdgPopup,
    xdg_surface: xdg_surface_1.XdgSurface,
    xdg_toplevel: xdg_toplevel_1.XdgToplevel,
    wl_region: wl_region_1.WlRegion,
    zxdg_decoration_manager_v1: zxdg_decoration_manager_v1_1.ZxdgDecorationManagerV1,
    zxdg_toplevel_decoration_v1: zxdg_decoration_manager_v1_1.ZxdgToplevelDecorationV1,
};
