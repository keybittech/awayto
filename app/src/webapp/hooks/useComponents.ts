import { createElement, useMemo, lazy } from 'react';
import { IBaseComponent, IBaseComponents, LazyComponentPromise } from 'awayto';

import build from '../build.json';

const { views } = build as Record<string, Record<string, string>>;

const components = {} as IBaseComponents;

/**
 * `useComponents` takes advantage of [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy) as well as the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). By combining these functionalities, we end up with a tool that seamlessly meshes with expanding and changing codebases.
 * 
 * As new files are added to the project while the developer is working, they will be automatically discovered and made lazily available through `useComponents`. The only need is to refresh the browser page once the component has been added to the render cycle.
 * 
 * ```
 * import { useComponents } from 'awayto';
 * 
 * const { NewDevelopmentComponent } = useComponents();
 * 
 * render <NewDevelopmentComponent {...props} />;
 * ```
 * 
 * @category Hooks
 */
export function useComponents(): IBaseComponents {
  
  const comps = useMemo(() => new Proxy(components, {
    get: function (target: IBaseComponents, prop: string): IBaseComponents {
      if (!components[prop]) {
        components[prop] = lazy((): LazyComponentPromise => import(`../modules/${views[prop]}`) as LazyComponentPromise);
      }
      
      target[prop] = views[prop] ? components[prop] : ((): JSX.Element => createElement('div')) as IBaseComponent

      return Reflect.get(target, prop) as IBaseComponents;
    }
  }), []);
  return comps;
}
