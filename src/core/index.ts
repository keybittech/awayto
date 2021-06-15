import build from './build.json';

import 'typeface-roboto';
import 'typeface-courgette';

import { lazy, createElement } from 'react';
import { addReducer, store, persistor } from './redux';
import { components } from './hooks/useComponents'
import { ILoadedState, IReducers } from './types/index.d';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { AnyAction, Store } from 'redux';

export * from './types/index.d';
export * from './redux';
export * from './actions';
export * from './style';
export * from './cognito';

export { useRedux } from './hooks/useRedux';
export { useDispatch } from './hooks/useDispatch';
export { useComponents } from './hooks/useComponents';
export { useCognitoUser } from './hooks/useCognitoUser';
export { useApi } from './hooks/useApi';

export async function asyncForEach<T>(array: T[], callback: (item: T, idx: number, arr: T[]) => Promise<void>): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export async function awaytodev(renderComponent: JSX.Element): Promise<void> {

  const { reducers } = build as Record<string, Record<string, string>>;

  await asyncForEach(Object.keys(reducers), async (reducer: string): Promise<void> => {
    const r = await import('../webapp/modules/' + reducers[reducer]) as { default: IReducers };
    addReducer(store as Store<ILoadedState, AnyAction>, { [reducer]: r.default });
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

const { views } = build as Record<string, Record<string, string>>;

Object.keys(views).forEach((view: string): void => {
  components[view] = lazy((): LazyComponentPromise => import('../webapp/modules/' + views[view]) as LazyComponentPromise)
})