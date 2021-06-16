import { createElement, useMemo } from 'react';
import { IBaseComponent, IBaseComponents } from '../types';

export const components = {} as IBaseComponents;

/**
 * @category Hooks
 */
export function useComponents(): IBaseComponents {
  const comps = useMemo(() => new Proxy(components, {
    get: function (target: IBaseComponents, prop: string): IBaseComponents {
      if (!target[prop]) {
        target[prop] = ((): JSX.Element => createElement('div')) as IBaseComponent
      }
      return Reflect.get(target, prop) as IBaseComponents;
    }
  }), []);
  return comps;
}
