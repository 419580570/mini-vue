import { ReactiveEffect } from "packages/reactivity/src/effect"
import { currentInstance } from "./component"
import { queueJob, queuePostFlushCb } from "./scheduler"

export function watchEffect(effect, options) {
  return doWatch(effect, null, options)
}

function doWatch(source, cb, {flush}) {
  const instance:any = currentInstance
  const job = () => {
    effect.run()
  }

  let scheduler;
  if(flush === "sync") {
    scheduler = job
  } else if(flush === "post") {
    scheduler = () => queuePostFlushCb(job)
  } else {
    // default "pre"
    job.pre = true
    if (instance) job.id = instance.uid
    scheduler = () => queueJob(job)
  }

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