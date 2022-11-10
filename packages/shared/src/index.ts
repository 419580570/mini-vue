export const NO = () => false

export const NOOP = () => {}

export const isObject = (value) => {
  return typeof value === "object" && value !== null
}

export const isString  = (value) => {
  return typeof value === 'string'
}
export const isNumber  = (value) => {
  return typeof value === 'number'
}
export const isFunction  = (value) => {
  return typeof value === 'function'
}

export const isArray = Array.isArray
export const assign = Object.assign

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOT_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

const camelizeRE = /-(\w)/g;
export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""))
}

const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = (string: string) => 
  string.replace(hyphenateRE, "-$1").toLowerCase()

export const capitalize = (str: string) => 
  str.charAt(0).toUpperCase() + str.slice(1)
  
export const toHandlerKey = (str: string) => 
  str ? `on${capitalize(str)}` : ``

export function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key)
}