export { createRenderer } from "./renderer";
export { h } from "./h";
export { renderSlot } from "./helpers/renderSlot";
export { getCurrentInstance } from "./component";
export { watchEffect } from "./apiWatch";
export { nextTick } from "./scheduler"
export { provide, inject } from "./apiInject"
export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onRenderTracked,
  onRenderTriggered,
  onErrorCaptured,
  onServerPrefetch
} from './apiLifecycle'

export * from "./vnode";

export * from "@vue/reactivity";
