import {Component, ComponentType, createElement, FunctionComponent, RenderableProps, VNode} from 'preact';

function shouldComponentUpdate(): false {
  return false;
}

/** Like memo(), but it never updates */
export function staticComponent<P>(comp: ComponentType<P>): FunctionComponent<P> {
  function Static(this: Component, props: RenderableProps<P>): VNode {
    this.shouldComponentUpdate = shouldComponentUpdate;

    return createElement(comp, Object.assign({}, props));
  }

  Static.displayName = `Static(${comp.displayName || comp.name})`;
  Static._forwarded = true;
  Static.prototype.isReactComponent = true;

  return Static;
}
