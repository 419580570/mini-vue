import { isObject } from "@vue/shared";
import {
  mutableHandlers,
  readonlyHandlers,
  ReactiveFlags,
  shallowReadonlyHandlers,
} from "./baseHandler";

export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();

export function isReactive(value) {
  debugger
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function reactive(target) {
  if (!isObject(target)) {
    return;
  }

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  return createReactiveObject(target, reactiveMap, mutableHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, readonlyMap, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObject(
    target,
    shallowReadonlyMap,
    shallowReadonlyHandlers
  );
}

function createReactiveObject(target, proxyMap, baseHandlers) {
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;

  const proxy = new Proxy(target, baseHandlers);

  proxyMap.set(target, proxy);
  return proxy;
}
