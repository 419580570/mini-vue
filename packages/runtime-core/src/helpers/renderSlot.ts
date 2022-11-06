import { createVnode, Fragment } from "../vnode";


export function renderSlot(slots, name: string, props = {}) {
  const slot = slots[name]

  if(slot) {
    const slotContent = slot(props)
    return createVnode(Fragment, {}, slotContent)
    // return slotContent
  }
}