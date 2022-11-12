import { createRenderer } from "@vue/runtime-core";
import { isString } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, {patchProp})

let renderer;

function ensureRenderer() {
  return (renderer || (renderer = createRenderer(renderOptions)))
}

export function render(...args) {
  ensureRenderer().render(...args)
}

export const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args)
  const { mount } = app
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector)
    if (!container) return
    container.innerHTML = ''
    const proxy = mount(container)
    return proxy
  }
  return app
}

function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container)
    return res
  }
  return container
}

export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}

export * from "@vue/runtime-core"