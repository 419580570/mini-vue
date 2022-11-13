import { isString, ShapeFlags } from "@vue/shared";
import { getSequence } from "./sequence";
import { createComponentInstance, setupComponent } from "./component";
import {
  createVnode,
  Fragment,
  isSameVnode,
  normalizeVNode,
  Text,
  Comment,
} from "./vnode";
import { ReactiveEffect } from "@vue/reactivity";
import { shouldUpdateComponent } from "./componentRenderUtils";
import { queueJob, queuePostFlushCb } from "./scheduler";
import { createAppAPI } from "./apiCreateApp";
import { invokeArrayFns } from "@vue/runtime-dom";

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = renderOptions;

  const unmount = (vnode, parentComponent, doRemove = false) => {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
      unmountComponent(vnode.component, doRemove);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(children, parentComponent, false);
    }
    if (doRemove) {
      hostRemove(vnode.el);
    }
  };

  const normalize = (children, i) => {
    if (isString(children[i])) {
      let vnode = createVnode(Text, null, children[i]);
      children[i] = vnode;
    }
    return children[i];
  };

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children, i);
      patch(null, child, container);
    }
  };

  function mountElement(vnode, container, anchor) {
    let { type, props, children, shapeFlag } = vnode;
    let el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container, anchor);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));

    setupComponent(instance);

    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    function componentUpdateFn() {
      if (!instance.isMounted) {
        const { bm, m, parent } = instance;
        toggleRecurse(instance, false);
        // beforeMount
        if (bm) {
          invokeArrayFns(bm);
        }
        // 组件更新时允许触发本身effect
        toggleRecurse(instance, true);
        const proxyToUse = instance.proxy;

        const subTree = (instance.subTree = normalizeVNode(
          instance.render.call(proxyToUse, proxyToUse)
        ));

        patch(null, subTree, container, null, instance);

        initialVNode.el = subTree.el;

        //mounted
        if (m) {
          queuePostFlushCb(m);
        }

        instance.isMounted = true;
      } else {
        const { next, bu, u, vnode } = instance;
        toggleRecurse(instance, false);

        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }
        // beforeUpdate hook
        if (bu) {
          invokeArrayFns(bu);
        }
        toggleRecurse(instance, true);

        const proxyToUse = instance.proxy;
        const nextTree = normalizeVNode(
          instance.render.call(proxyToUse, proxyToUse)
        );

        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(prevTree, nextTree, prevTree.el, null, instance);
        // updated hook
        if (u) {
          queuePostFlushCb(u);
        }
      }
    }
    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(update)
      // instance.scope
    ));
    const update: any = (instance.update = () => effect.run());
    update.id = instance.uid;
    update();
    // instance.update = effect(componentUpdateFn, {
    //   scheduler: () => {
    //     // instance.update();
    //     queueJob(instance.update)
    //   },
    // });
  }

  function updateComponentPreRender(instance, nextVNode) {
    nextVNode.component = instance;

    instance.vnode = nextVNode;
    instance.next = null;

    const { props } = nextVNode;
    instance.props = props;
  }

  const patchProps = (oldProps: any, newProps: any, el: any) => {
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = undefined;
      if (!(key in newProps)) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
  };

  const unmountChildren = (children, parentComponent, doRemove = false) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i], parentComponent, doRemove);
    }
  };

  const unmountComponent = (instance, doRemove) => {
    const { bum, um, subTree, update } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    if (update) {
      update.active = false;
      unmount(subTree, instance, doRemove);
    }

    if (um) {
      queuePostFlushCb(um);
    }
    queuePostFlushCb(() => {
      instance.isUnmounted = true;
    });
  };

  const patchKeyedChildren = (c1, c2, el, anchor, parentComponent) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 特殊处理

    //sync from start
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el, anchor, parentComponent);
      } else {
        break;
      }
      i++;
    }

    //sync from end
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el, anchor, parentComponent);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    //common sequence + mount
    // i要比e1大说明有新增的
    // i和e2之间的是新增的部分
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor, parentComponent); //创建新节点
          i++;
        }
      }
    } else if (i > e2) {
      //common sequence + unmount
      // i要比e2大说明要有卸载的
      // i和e1之间的是卸载的部分
      while (i <= e1) {
        unmount(c1[i], parentComponent, true);
        i++;
      }
    }

    // 优化完毕 乱序对比
    let s1 = i;
    let s2 = i;
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }

    let patched = 0;
    //循环老的元素 看一下新的里面有没有，如果有说明要比较差异，没有要的添加到列表中，老的有新的没有的要删除
    const toBePatched = e2 - s2 + 1; //新的总个数
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i];
      if (patched >= toBePatched) {
        unmount(oldChild, parentComponent, true);
      }
      let newIndex = keyToNewIndexMap.get(oldChild.key);
      if (newIndex == undefined) {
        unmount(oldChild, parentComponent, true);
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(oldChild, c2[newIndex], el, anchor, parentComponent);
        patched++;
      }
    }

    let increment = getSequence(newIndexToOldIndexMap);
    let j = increment.length - 1;

    // 移动位置
    for (let i = toBePatched - 1; i >= 0; i--) {
      let index = i + s2;
      let current = c2[index];
      let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, current, el, anchor, parentComponent);
      } else {
        if (i != increment[j]) {
          hostInsert(current.el, el, anchor);
        } else {
          j--;
        }
      }
    }
  };

  const patchChildren = (n1, n2, el, anchor, parentComponent) => {
    const c1 = n1.children;
    const c2 = n2.children;

    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    /**
     *   |   新   |   旧   |           操作方式
     *---|--------|--------|--------------------------------
     * 1 |  文本  |  数组  |  （删除老儿子，设置文本内容）
     * 2 |  文本  |  文本  |  （更新文本即可）
     * 3 |  文本  |  空    |  （无需处理）
     * 4 |  数组  |  数组  |  （diff算法）
     * 5 |  数组  |  文本  |  （清空文本，进行挂载）
     * 6 |  数组  |  空    |  （无需处理）
     * 7 |  空    |  数组  |  （删除所有儿子）
     * 8 |  空    |  文本  |  （清空文本）
     * 9 |  空    |  空    |  （无需处理）
     */

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1
        // 删除所有子节点
        unmountChildren(c1, parentComponent);
      }
      if (c1 !== c2) {
        // 2
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 4
          patchKeyedChildren(c1, c2, el, anchor, parentComponent);
        } else {
          unmountChildren(c1, parentComponent, true); // 7
        }
      } else {
        // 5, 8
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };

  const patchElement = (n1, n2, container, anchor, parentComponent) => {
    //先复用节点，再比较属性，再比较儿子
    let el = (n2.el = n1.el);

    let oldProps = n1.props || {};
    let newProps = n2.props || {};

    patchProps(oldProps, newProps, el);

    patchChildren(n1, n2, el, anchor, parentComponent);
  };

  const patchComponent = (n1, n2, container) => {
    const instance = (n2.component = n1.component);

    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.component = n1.component;
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      //初始化渲染
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    } else {
      const el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateComment((n2.children as string) || "")),
        container,
        anchor
      );
    } else {
      // there's no support for dynamic comments
      n2.el = n1.el;
    }
  };

  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 === null) {
      //初始化渲染
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container, anchor, parentComponent);
    }
  };

  const processFragment = (n1, n2, container, anchor, parentComponent) => {
    if (n1 == null) {
      mountChildren(n2.children, container);
    } else {
      patchChildren(n1, n2, container, anchor, parentComponent);
    }
  };

  const processComponent = (n1, n2, container, parentComponent) => {
    if (n1 == null) {
      mountComponent(n2, container, parentComponent);
    } else {
      patchComponent(n1, n2, container);
    }
  };

  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    if (n1 === n2) return;
    if (n1 && !isSameVnode(n1, n2)) {
      //判断两个元素是否相同，不相同卸载在添加
      unmount(n1, parentComponent, true);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
    }
  };

  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        // 之前渲染过
        unmount(container._vnode, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render,
    createApp: createAppAPI(render),
  };
}

function toggleRecurse({ effect, update }, allowed: boolean) {
  effect.allowRecurse = update.allowRecurse = allowed;
}
