import build from './build.json';

import 'typeface-roboto';
import 'typeface-courgette';

import { lazy, createElement } from 'react';
import { addReducer, store, persistor } from './redux';
import { components } from './hooks/useComponents'
import { IReducers, LazyComponentPromise } from './types/index.d';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { asyncForEach } from './util';

export * from './types/index.d';
export * from './util';
export * from './redux';
export * from './actions';
export * from './style';
export * from './cognito';

export { useState } from 'react';
export { useRedux } from './hooks/useRedux';
export { useDispatch } from './hooks/useDispatch';
export { useComponents } from './hooks/useComponents';
export { useCognitoUser } from './hooks/useCognitoUser';
export { useApi, registerApi } from './hooks/useApi';

/**
 * <p>Awayto bootstrapping function. This will begin the lazy loading of the site's components using the build.json info generated by the {@link checkWriteBuildFile}. The same json is then used to fetch the reducers and await their loading before the site loads.</p>
 * <p>The dev could potentially load the site on any given page which may use any given reducer. So the reducers should be loaded as they will perform the functionality to return any data which may be necessary for the React.lazy component to get past Suspense.</p>
 * <p>In the future, we want to be more intelligent about how to pick which reducer to load, but it's not a major optimization.</p>
 * 
 * @category Awayto
 * @param renderComponent {JSX.Element} The typical element structure you would give when calling React's `render()`
 */
export async function awayto(renderComponent: JSX.Element): Promise<void> {

  const { views } = build as Record<string, Record<string, string>>;
  
  Object.keys(views).forEach((view: string): void => {
    components[view] = lazy((): LazyComponentPromise => import('../webapp/modules/' + views[view]) as LazyComponentPromise)
  })

  const { reducers } = build as Record<string, Record<string, string>>;

  await asyncForEach(Object.keys(reducers), async (reducer: string): Promise<void> => {
    const r = await import('../webapp/modules/' + reducers[reducer]) as { default: IReducers };
    addReducer({ [reducer]: r.default });
  });

  const props = { store, loading: null, persistor };

  render(
    createElement(Provider, props,
      createElement(PersistGate, props,
        renderComponent
      )
    ), document.querySelector('#root')
  )

}