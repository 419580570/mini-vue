import { isArray, isObject } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

export function h(type, propsChlidren, children) {
  const l = arguments.length
  if(l === 2) {
    if(isObject(propsChlidren) && !isArray(propsChlidren)) {
      if(isVnode(propsChlidren)) { // 虚拟节点包装成数组
        return createVnode(type, null, [propsChlidren])
      }
      return createVnode(type, propsChlidren)
    } else {
      return createVnode(type, null, propsChlidren) // 是数组
    }
  } else {
    if(l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) {
      children = [children]
    }
    return createVnode(type, propsChlidren, children)
  }
}