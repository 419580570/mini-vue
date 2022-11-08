import { ReactiveEffect } from "packages/reactivity/src/effect"
import { queuePreFlushCb } from "./scheduler"

export function watchEffect(effect) {
  return doWatch(effect)
}

function doWatch(source) {
  const job = () => {
    effect.run()
  }

  const scheduler = () => queuePreFlushCb(job)

  let cleanup
  const onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      fn()
    }
  }

  const getter = () => {
    if(cleanup) {
      cleanup()
    }

    source(onCleanup)
  }

  const effect = new ReactiveEffect(getter, scheduler)

  effect.run()

  return () => {
    effect.stop()
  }
}