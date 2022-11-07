export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  if(prevProps === nextProps) {
    return false
  }

  if(!prevProps) {
    return !!nextProps
  }

  if(!nextProps) {
    return true
  }

  return hasPropsChange(prevProps, nextProps)
}

function hasPropsChange(prevProps, nextProps): boolean {
  const nextKeys = Object.keys(nextProps)

  if(nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }

  for(let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if( nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}
