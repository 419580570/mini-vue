import { ShapeFlags } from "@vue/shared"

export function initSlots(instance, children) {
  const {vnode} = instance
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}))
  } else if(vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    instance.slots.default = () => vnode.children
  }
}

const normalizeSlotValue = (value) => {
  return Array.isArray(value) ? value : [value]
}

const normalizeObjectSlots = (rawSlots, slots) => {
  for (const key in rawSlots) {
    const value = rawSlots[key]
    if (typeof value === 'function') {
      slots[key] = (props) => normalizeSlotValue(value(props))
    }
  }
}