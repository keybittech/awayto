// React imports
import 'typeface-roboto';
import 'typeface-courgette';
import React, { FunctionComponent, createElement } from 'react';
import MomentUtils from '@date-io/moment';
import { RouteComponentProps } from 'react-router';
import { ConnectedRouter, routerMiddleware, connectRouter, RouterState } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { createBrowserHistory, History } from 'history';
import { createStore, applyMiddleware, compose, combineReducers, Reducer, ReducersMapObject } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import createDebounce from 'redux-debounced';
import logger from 'redux-logger';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer, PersistState } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import persistStore from 'redux-persist/es/persistStore';

import { setStore, ThunkStore } from './hooks/useDispatch';
import { asyncForEach, ILoadedState } from 'awayto';

import build from './build.json';
import reportWebVitals from './reportWebVitals';
import './index.css';
import App from './App';

declare global {
  /**
   * @category Awayto Redux
   */
  interface ISharedState {
    components: IBaseComponents;
    _persist: PersistState;
    router: RouterState<unknown>;
  }

  /**
   * @category Awayto React
   */
  interface IProps extends SafeRouteProps {
    classes: Record<string, string>;
    closeModal?(): void;
    // [prop: string]: SiteRoles | ReactElement | SafeRouteProps[keyof SafeRouteProps] | undefined | boolean | string | number | ILoadedState | (() => void);
  }
}

type RouteProps = { [prop: string]: string }
type SafeRouteProps = Omit<RouteComponentProps<RouteProps>, "staticContext">;


/**
 * @category Awayto Redux
 */
 export type IReducers = ReducersMapObject<ISharedState, ISharedActions>;

 /**
  * @category Awayto Redux
  */
 export type ILoadedReducers = Partial<IReducers>;

/**
 * @category Awayto React
 */
 export type IBaseComponent = FunctionComponent<IProps>

 /**
  * @category Awayto React
  */
 export type IBaseComponents = { [component: string]: IBaseComponent }
 
/**
 * @category Awayto React
 */
export type LazyComponentPromise = Promise<{ default: IBaseComponent }>

/**
 * @category Awayto React
 */
export type TempComponent = IBaseComponent | string | undefined

/**
 * @category Redux
 */
export const history: History<unknown> = createBrowserHistory();

const initialRootState = {} as ISharedState;
const rootReducer: Reducer<ILoadedState, ISharedActions> = (state = initialRootState) => {
  return state as ISharedState;
}

type RootLoadedReducers = ILoadedReducers & { root: Reducer<ILoadedState, ISharedActions> };

/**
 * @category Redux
 */
let initialReducers = {
  root: rootReducer,
  router: connectRouter(history)
} as RootLoadedReducers;

const createRootReducer = (): Reducer<ILoadedState, ISharedActions> => {
  return combineReducers(initialReducers) as Reducer;
};

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2
}

const persistedReducer = persistReducer(persistConfig, createRootReducer);

/**
 * @category Redux
 */
export const store = createStore(
  persistedReducer,
  initialRootState,
  compose(
    applyMiddleware(
      createDebounce(),
      routerMiddleware(history),
      thunk as ThunkMiddleware<ISharedState, ISharedActions>,
      logger
    )
  )
) as ThunkStore;

setStore(store);

/**
 * @category Redux
 */
export const persistor = persistStore(store);

/**
 * @category Redux
 */
export const addReducer = (reducers: ILoadedReducers): void => {
  initialReducers = { ...initialReducers, ...reducers };
  store.replaceReducer(createRootReducer() as Reducer);
}

















// import { history, store, persistor, addReducer } from './redux';

/**
 * 
 * Awayto bootstrapping function. Loads module structure into redux then bootstraps react. This is done to support the dynamic module structure in general, which includes reducers.
 * 
 * The dev could potentially load the site on any given page which may use any given reducer. So the reducers should be loaded as they will perform the functionality to return any data which may be necessary for the React.lazy component to get past Suspense.
 * 
 * In the future, we want to be more intelligent about how to pick which reducer to load, but it's not a major optimization.
 * 
 * @category Awayto
 * @param renderComponent {JSX.Element} The typical element structure you would give when calling React's `render()`
 */
export async function awayto(renderComponent: JSX.Element): Promise<void> {

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

awayto(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </MuiPickersUtilsProvider>
).catch(console.error);

reportWebVitals(console.log);