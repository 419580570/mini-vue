import { isArray, isFunction, isString, ShapeFlags } from "@vue/shared";
export const Text = Symbol("Text");
export const Comment = Symbol('Comment')
export const Fragment = Symbol("Fragment");
export function isVnode(value) {
  return !!value?.__v_isVNode;
}

export function isSameVnode(n1, n2) {
  //判断两个虚拟节点是否相同节点,套路是1） 标签名 相同 2） key是一样的
  return n1.type === n2.type && n1.key === n2.key;
}

export function createVnode(type, props?, children = null) {
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;

  const vnode = {
    type,
    props: props || {},
    children,
    el: null,
    component: null,
    key: props?.["key"],
    shapeFlag,
    __v_isVNode: true,
    appContext: null,
  };

  normalizeChildren(vnode, children);
  return vnode;
}

export function normalizeChildren(vnode, children) {
  let type = 0;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children === "object") {
    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
      // ...
    } else {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  } else if (isFunction(children)) {
    //
  } else {
    children = String(children);
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeFlag |= type;
}

export function normalizeVNode(child) {
  if(child == null || typeof child === 'boolean') {
    return createVnode(Comment)
  } else if(isArray(child)) {
    return createVnode(Fragment, null, child.slice())
  } else if(typeof child === 'object') {
    return child;
  } else {
    return createVnode(Text, null, String(child));
  }
}
