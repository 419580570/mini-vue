var VueRuntimeDOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    Text: () => Text,
    createRenderer: () => createRenderer,
    createVnode: () => createVnode,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    isSameVnode: () => isSameVnode,
    isVnode: () => isVnode,
    normalizeChildren: () => normalizeChildren,
    normalizeVNode: () => normalizeVNode,
    render: () => render,
    renderSlot: () => renderSlot
  });

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isString = (value) => {
    return typeof value === "string";
  };
  var isArray = Array.isArray;
  var camelizeRE = /-(\w)/g;
  function camelize(str) {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
  }
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = (string) => string.replace(hyphenateRE, "-$1").toLowerCase();
  var capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  var toHandlerKey = (str) => str ? `on${capitalize(str)}` : ``;
  function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    const len = arr.length;
    const result = [0];
    const p = new Array(len).fill(0);
    let start, end, middle, resultLastIndex;
    for (let i2 = 0; i2 < len; i2++) {
      let arrI = arr[i2];
      if (arrI !== 0) {
        resultLastIndex = result[result.length - 1];
        if (arr[resultLastIndex] < arrI) {
          result.push(i2);
          p[i2] = resultLastIndex;
          continue;
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {
          middle = (start + end) / 2 | 0;
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arr[result[end]] > arrI) {
          result[end] = i2;
          p[i2] = result[end - 1];
        }
      }
    }
    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
      result[i] = last;
      last = p[last];
    }
    return result;
  }

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function cleanupEffect(effect2) {
    const { deps } = effect2;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.deps = [];
      this.active = true;
    }
    run() {
      if (!this.active) {
        this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = null;
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        cleanupEffect(this);
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
  function trackEffects(dep) {
    if (activeEffect) {
      let shouldTrack = !dep.has(activeEffect);
      if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
      }
    }
  }
  function trigger(target, type, key, value, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    let effects = depsMap.get(key);
    if (effects) {
      triggerEffects(effects);
    }
  }
  function triggerEffects(effects) {
    effects = new Set(effects);
    effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }

  // packages/reactivity/src/baseHandler.ts
  var get = createGetter();
  var set = createSetter();
  var readonlyGet = createGetter(true);
  var shallowReadonlyGet = createGetter(true, true);
  var mutableHandlers = {
    get,
    set
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      console.warn(
        `[Vue Warn] Set operation on key "${String(
          key
        )}" failed: target is readonly.`,
        target
      );
      return true;
    }
  };
  var shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key) {
      console.warn(
        `[Vue Warn] Set operation on key "${String(
          key
        )}" failed: target is readonly.`,
        target
      );
      return true;
    }
  };
  function createGetter(isReadonly = false, shallow = false) {
    return function get2(target, key, receiver) {
      const isExistInReactiveMap = () => key === "__v_raw" /* RAW */ && receiver === reactiveMap.get(target);
      const isExistInReadonlyMap = () => key === "__v_raw" /* RAW */ && receiver === readonlyMap.get(target);
      const isExistInShallowReadonlyMap = () => key === "__v_raw" /* RAW */ && receiver === shallowReadonlyMap.get(target);
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return !isReadonly;
      } else if (key === "__v_isReadonly" /* IS_READONLY */) {
        return isReadonly;
      } else if (isExistInReactiveMap() || isExistInReadonlyMap() || isExistInShallowReadonlyMap()) {
        return target;
      }
      const res = Reflect.get(target, key, receiver);
      if (!isReadonly) {
        track(target, "get", key);
      }
      if (shallow) {
        return res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    };
  }
  function createSetter() {
    return function set2(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue != value) {
        trigger(target, "set", key, value, oldValue);
      }
      return result;
    };
  }

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    return createReactiveObject(target, reactiveMap, mutableHandlers);
  }
  function readonly(target) {
    return createReactiveObject(target, readonlyMap, readonlyHandlers);
  }
  function shallowReadonly(target) {
    return createReactiveObject(
      target,
      shallowReadonlyMap,
      shallowReadonlyHandlers
    );
  }
  function createReactiveObject(target, proxyMap, baseHandlers) {
    const existingProxy = proxyMap.get(target);
    if (existingProxy)
      return existingProxy;
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/ref.ts
  function proxyRefs(object) {
    return new Proxy(object, {
      get(target, key, receiver) {
        let r = Reflect.get(target, key, receiver);
        return r.__v_isRef ? r.value : r;
      },
      set(target, key, value, receiver) {
        let oldValue = target[key];
        if (oldValue.__v_isRef) {
          oldValue.value = value;
          return true;
        } else {
          return Reflect.set(target, key, value, receiver);
        }
      }
    });
  }

  // packages/runtime-core/src/componentEmits.ts
  function emit(instance, event, ...rawArgs) {
    const props = instance.props;
    let handler = props[toHandlerKey(camelize(event))];
    if (!handler) {
      handler = props[toHandlerKey(hyphenate(event))];
    }
    if (handler) {
      handler(...rawArgs);
    }
  }

  // packages/runtime-core/src/componentProps.ts
  function initProps(instance, rawProps) {
    instance.props = rawProps;
  }

  // packages/runtime-core/src/componentPublicInstance.ts
  var PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
      const { setupState, props } = instance;
      if (key[0] !== "$") {
        if (hasOwn(setupState, key)) {
          return setupState[key];
        } else if (hasOwn(props, key)) {
          return props[key];
        }
      }
      const publicGetter = publicPropertiesMap[key];
      if (publicGetter) {
        return publicGetter(instance);
      }
    },
    set({ _: instance }, key, value) {
      const { setupState } = instance;
      if (hasOwn(setupState, key)) {
        setupState[key] = value;
      }
      return true;
    }
  };
  var publicPropertiesMap = {
    $el: (i) => i.vnode,
    $emit: (i) => i.emit,
    $slots: (i) => i.slots,
    $props: (i) => i.props
  };

  // packages/runtime-core/src/componentSlots.ts
  function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOT_CHILDREN */) {
      normalizeObjectSlots(children, instance.slots = {});
    } else if (vnode.shapeFlag & 8 /* TEXT_CHILDREN */) {
      instance.slots.default = () => vnode.children;
    }
  }
  var normalizeSlotValue = (value) => {
    return Array.isArray(value) ? value : [value];
  };
  var normalizeObjectSlots = (rawSlots, slots) => {
    for (const key in rawSlots) {
      const value = rawSlots[key];
      if (typeof value === "function") {
        slots[key] = (props) => normalizeSlotValue(value(props));
      }
    }
  };

  // packages/runtime-core/src/component.ts
  function createComponentInstance(vnode, parent) {
    const instance = {
      type: vnode.type,
      vnode,
      next: null,
      props: {},
      parent,
      provides: parent ? parent.provides : {},
      proxy: null,
      isMounted: false,
      attrs: {},
      slots: {},
      ctx: {},
      setupState: {},
      emit: () => {
      }
    };
    instance.ctx = {
      _: instance
    };
    instance.emit = emit.bind(null, instance);
    return instance;
  }
  function setupComponent(instance) {
    const { props, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    setupStatefulComponent(instance);
  }
  function setupStatefulComponent(instance) {
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
      setCurrentInstance(instance);
      const setupContext = createSetupContext(instance);
      const setupResult = setup && setup(shallowReadonly(instance.props), setupContext);
      setCurrentInstance(null);
      handleSetupResult(instance, setupResult);
    }
  }
  function createSetupContext(instance) {
    return {
      attrs: instance.attrs,
      slots: instance.slots,
      emit: instance.emit,
      expose: () => {
      }
    };
  }
  function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") {
      instance.render = setupResult;
    } else if (typeof setupResult === "object") {
      instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
  }
  function finishComponentSetup(instance) {
    const Component = instance.type;
    if (!instance.render) {
      if (compile && !Component.render) {
        if (Component.template) {
          const template = Component.template;
          Component.render = compile(template);
        }
      }
      instance.render = Component.render;
    }
  }
  var currentInstance = {};
  function getCurrentInstance() {
    return currentInstance;
  }
  function setCurrentInstance(instance) {
    currentInstance = instance;
  }
  var compile;

  // packages/runtime-core/src/vnode.ts
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function isVnode(value) {
    return !!(value == null ? void 0 : value.__v_isVNode);
  }
  function isSameVnode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function createVnode(type, props, children = null) {
    let shapeFlag = isString(type) ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
    const vnode = {
      type,
      props: props || {},
      children,
      el: null,
      component: null,
      key: props == null ? void 0 : props["key"],
      shapeFlag,
      __v_isVNode: true
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else if (typeof children === "string") {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlag |= type2;
    }
    normalizeChildren(vnode, children);
    return vnode;
  }
  function normalizeChildren(vnode, children) {
    if (typeof children === "object") {
      if (vnode.shapeFlag & 1 /* ELEMENT */) {
      } else {
        vnode.shapeFlag |= 32 /* SLOT_CHILDREN */;
      }
    }
  }
  function normalizeVNode(child) {
    if (typeof child == "string" || typeof child === "number") {
      return createVnode(Text, null, String(child));
    } else {
      return child;
    }
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderer(renderOptions2) {
    const {
      insert: hostInsert,
      remove: hostRemove,
      patchProp: hostPatchProp,
      createElement: hostCreateElement,
      createText: hostCreateText,
      setText: hostSetText,
      setElementText: hostSetElementText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling
    } = renderOptions2;
    const unmount = (vnode) => {
      hostRemove(vnode.el);
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
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        for (let key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    }
    function mountComponent(initialVNode, container, parentComponent) {
      const instance = initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent
      );
      setupComponent(instance);
      setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
      function componentUpdateFn() {
        if (!instance.isMounted) {
          const proxyToUse = instance.proxy;
          const subTree = instance.subTree = normalizeVNode(
            instance.render.call(proxyToUse, proxyToUse)
          );
          patch(null, subTree, container, null, instance);
          initialVNode.el = subTree.el;
          instance.isMounted = true;
        } else {
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const proxyToUse = instance.proxy;
          const nextTree = normalizeVNode(
            instance.render.call(proxyToUse, proxyToUse)
          );
          const prevTree = instance.subTree;
          instance.subTree = nextTree;
          patch(prevTree, nextTree, prevTree.el, null, instance);
        }
      }
      instance.update = effect(componentUpdateFn, {
        scheduler: () => {
        }
      });
    }
    function updateComponentPreRender(instance, nextVNode) {
      nextVNode.component = instance;
      instance.vnode = nextVNode;
      instance.next = null;
      const { props } = nextVNode;
      instance.props = props;
    }
    const patchProps = (oldProps, newProps, el) => {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
      for (const key in oldProps) {
        const prevProp = oldProps[key];
        const nextProp = void 0;
        if (!(key in newProps)) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
    };
    const unmountChildren = (children) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    };
    const patchKeyedChildren = (c1, c2, el, anchor, parentComponent) => {
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
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
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPos = e2 + 1;
            const anchor2 = nextPos < c2.length ? c2[nextPos].el : null;
            patch(null, c2[i], el, anchor2, parentComponent);
            i++;
          }
        }
      } else if (i > e2) {
        if (i <= e1) {
          while (i <= e1) {
            unmount(c1[i]);
            i++;
          }
        }
      }
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        keyToNewIndexMap.set(c2[i2].key, i2);
      }
      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChild = c1[i2];
        let newIndex = keyToNewIndexMap.get(oldChild.key);
        if (newIndex == void 0) {
          unmount(oldChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(oldChild, c2[newIndex], el, anchor, parentComponent);
        }
      }
      let increment = getSequence(newIndexToOldIndexMap);
      let j = increment.length - 1;
      for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
        let index = i2 + s2;
        let current = c2[index];
        let anchor2 = index + 1 < c2.length ? c2[index + 1].el : null;
        if (newIndexToOldIndexMap[i2] === 0) {
          patch(null, current, el, anchor2, parentComponent);
        } else {
          if (i2 != increment[j]) {
            hostInsert(current.el, el, anchor2);
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
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el, anchor, parentComponent);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    };
    const patchElement = (n1, n2, container, anchor, parentComponent) => {
      let el = n2.el = n1.el;
      let oldProps = n1.props || {};
      let newProps = n2.props || {};
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el, anchor, parentComponent);
    };
    const processText = (n1, n2, container) => {
      if (n1 === null) {
        hostInsert(n2.el = hostCreateText(n2.children), container);
      } else {
        const el = n2.el = n1.el;
        if (n1.children !== n2.children) {
          hostSetText(el, n2.children);
        }
      }
    };
    const processElement = (n1, n2, container, anchor, parentComponent) => {
      if (n1 === null) {
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
      }
    };
    const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
      if (n1 === n2)
        return;
      if (n1 && !isSameVnode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container, anchor, parentComponent);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor, parentComponent);
          } else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, parentComponent);
          }
      }
    };
    const render2 = (vnode, container) => {
      if (vnode === null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }

  // packages/runtime-core/src/h.ts
  function h(type, propsChlidren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsChlidren) && !isArray(propsChlidren)) {
        if (isVnode(propsChlidren)) {
          return createVnode(type, null, [propsChlidren]);
        }
        return createVnode(type, propsChlidren);
      } else {
        return createVnode(type, null, propsChlidren);
      }
    } else {
      if (l > 3) {
        children = Array.from(arguments).slice(2);
      } else if (l === 3 && isVnode(children)) {
        children = [children];
      }
      return createVnode(type, propsChlidren, children);
    }
  }

  // packages/runtime-core/src/helpers/renderSlot.ts
  function renderSlot(slots, name, props = {}) {
    const slot = slots[name];
    if (slot) {
      const slotContent = slot(props);
      return createVnode(Fragment, {}, slotContent);
    }
  }

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    insert(child, parent, anchor = null) {
      parent.insertBefore(child, anchor);
    },
    remove(child) {
      const parentNode = child.parentNode;
      if (parentNode) {
        parentNode.removeChild(child);
      }
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    setText(node, text) {
      node.nodeValue = text;
    },
    querySelector(selector) {
      return document.querySelector(selector);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nextSibling(node) {
      return node.nextSibling;
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    }
  };

  // packages/runtime-dom/src/modules/attr.ts
  function patchAttr(el, key, nextValue) {
    if (nextValue) {
      el.setAttribute(key, nextValue);
    } else {
      el.removeAttribute(key);
    }
  }

  // packages/runtime-dom/src/modules/class.ts
  function patchClass(el, nextValue) {
    if (nextValue == null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/modules/event.ts
  function patchEvent(el, eventName, nextValue) {
    let invokers = el._vei || (el._vei = {});
    let exist = invokers[eventName];
    if (exist && nextValue) {
      exist.value = nextValue;
    } else {
      let event = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = invokers[eventName] = createInvoker(nextValue);
        el.addEventListener(event, invoker);
      } else if (exist) {
        el.removeEventListener(event, exist);
        invokers[eventName] = void 0;
      }
    }
  }
  function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
  }

  // packages/runtime-dom/src/modules/style.ts
  function patchStyle(el, prevValue, nextValue = {}) {
    for (let key in nextValue) {
      el.style[key] = nextValue[key];
    }
    if (prevValue) {
      for (let key in prevValue) {
        if (nextValue[key] == null) {
          el.style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  function patchProp(el, key, prevValue, nextValue) {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  }

  // packages/runtime-dom/src/index.ts
  var renderOptions = Object.assign(nodeOps, { patchProp });
  function render(vnode, container) {
    createRenderer(renderOptions).render(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
