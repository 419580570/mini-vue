import { isArray, isString, ShapeFlags } from "@vue/shared";
export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
export function isVnode(value) {
  return !!(value?.__v_isVNode)
}

export function isSameVnode(n1, n2) { //判断两个虚拟节点是否相同节点,套路是1） 标签名 相同 2） key是一样的
  return (n1.type === n2.type) && (n1.key === n2.key)
}

export function createVnode(type, props, children = null) {
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;

  const vnode = {
    type,
    props: props || {},
    children,
    el: null,
    component: null,
    key: props?.['key'],
    shapeFlag,
    __v_isVNode: true,
  }

  if(children) {
    let type = 0
    if(isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else if(typeof children === "string") {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  normalizeChildren(vnode, children)
  return vnode
}

export function normalizeChildren(vnode, children) {
  if(typeof children === 'object') {
    if(vnode.shapeFlag & ShapeFlags.ELEMENT) {
      // ...
    } else {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
}

export function normalizeVNode(child) {
  if(typeof child == "string" || typeof child === "number") {
    return createVnode(Text, null, String(child))
  } else {
    return child
  }
}