import { isFunction, NO } from "@vue/shared";
import { createVnode } from "./vnode";

export function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: undefined,
      warnHandler: undefined,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}

export function createAppAPI(render, hydrate = null) {
  return function createApp(rootComponent, rootProps = null) {
    let isMounted = false;

    const context = createAppContext();
    const installedPlugins = new Set()

    const app = {
      _container: null,
      _component: rootComponent,
      get config() {
        return context.config;
      },
      set config(v) {
        console.warn(
          "app.config cannot be replaced. Modify individual options instead"
        );
      },
      mount(rootContainer) {
        if (!isMounted) {
          const vnode = createVnode(rootComponent);
          vnode.appContext = context;
          render(vnode, rootContainer);
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      component(name, component?) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app
      },
      directive(name, directive?) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app
      },
      provide(key, value) {
        context.provides[key] = value
        return app
      },
      use(plugin, ...options) {
        if(installedPlugins.has(plugin)) {
          console.warn("Plugin has already been applied to target app.")
        } else if(plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin)
          plugin.install(app, ...options)
        } else if(isFunction(plugin)) {
          installedPlugins.add(plugin)
          plugin(app, ...options)
        } else {
          console.warn("A plugin must either be a function or an object with an \"install\" function")
        }
        return app
      }
    };

    return app;
  };
}
