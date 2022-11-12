import { pauseTracking, resetTracking } from "@vue/reactivity";
import { currentInstance, LifecycleHooks, setCurrentInstance } from "./component";

export const createHook =
  lifecycle =>
  (hook, target = currentInstance) =>
    injectHook(lifecycle, (...args) => hook(...args), target);

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED);
export const onServerPrefetch = createHook(LifecycleHooks.SERVER_PREFETCH);
export const onRenderTriggered = createHook(LifecycleHooks.RENDER_TRIGGERED);
export const onRenderTracked = createHook(LifecycleHooks.RENDER_TRACKED);
export function onErrorCaptured(hook, target) {
  injectHook(LifecycleHooks.ERROR_CAPTURED, hook, target);
}

export function injectHook(
  type,
  hook,
  target: any = currentInstance,
  prepend = false
) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrapperHook = hook.__weh || (hook.__weh = (...args) => {
      if(target.isUnmounted) {
        return
      }
      pauseTracking()
      setCurrentInstance(target)
      const res = hook(target, args)
      setCurrentInstance(null)
      resetTracking()
      return res
    });
    if(prepend) {
      hooks.unshift(wrapperHook)
    } else {
      hooks.push(wrapperHook)
    }
  }
}
