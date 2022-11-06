import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traversal(value, set = new Set()) {
  if(!isObject(value)) return value
  if(set.has(value)) {
    return value
  }
  set.add(value)

  for(let key in value) {
    traversal(value[key], set)
  }

  return value
}

export function watch(source, cb) {
  let getter;
  if(isReactive(source)) {
    getter = () => traversal(source)
  } else if(isFunction(source)) {
    getter = source
  }
  let cleanUp;
  const onCleanup = (fn) => {
    cleanUp = fn
  }
  let oldValue
  const job = () => {
    if(cleanUp) cleanUp()
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter, job)
  oldValue =  effect.run()
}