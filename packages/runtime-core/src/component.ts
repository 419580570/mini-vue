import { shallowReadonly } from "@vue/reactivity";
import { proxyRefs } from "@vue/reactivity";
import { emit } from "./componentEmits";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  const instance = {
    type: vnode.type,
    vnode,
    next: null, // 需要更新的 vnode，用于更新 component 类型的组件
    props: {},
    parent,
    provides: parent ? parent.provides : {}, //  获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
    proxy: null,
    isMounted: false,
    attrs: {}, // 存放 attrs 的数据
    slots: {}, // 存放插槽的数据
    ctx: {}, // context 对象
    setupState: {}, // 存储 setup 的返回值
    emit: () => {},
  };

  // 在 prod 坏境下的 ctx 只是下面简单的结构
  // 在 dev 环境下会更复杂
  instance.ctx = {
    _: instance,
  };

  instance.emit = emit.bind(null, instance) as any;
  return instance;
}

export function setupComponent(instance) {
  const { props, children } = instance.vnode;
  initProps(instance, props);

  initSlots(instance, children);

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    setCurrentInstance(instance);

    const setupContext = createSetupContext(instance);

    const setupResult =
      setup && setup(shallowReadonly(instance.props), setupContext);

    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: () => {},
  };
}

function handleSetupResult(instance, setupResult) {
  if(typeof setupResult === 'function') {
    instance.render = setupResult
  } else if(typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  if(!instance.render) {
    if(compile && !Component.render) {
      if(Component.template) {
        const template = Component.template
        Component.render = compile(template)
      }
    }

    instance.render = Component.render
  }
}

let currentInstance = {};

export function getCurrentInstance(): any {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

let compile;
export function registerRuntimeCompiler(_compile) {
  compile = _compile;
}

// ----------------------
// registerRuntimeCompiler(() => {console.log('complier~~')})
