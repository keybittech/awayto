import { createBrowserHistory, History } from 'history';
import { createStore, applyMiddleware, compose, AnyAction, combineReducers, Reducer, Store } from 'redux';
import { routerMiddleware, connectRouter, RouterState } from 'connected-react-router';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import createDebounce from 'redux-debounced';
import logger from 'redux-logger';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { ILoadedReducers, ILoadedState, IActions, IState, IUtilActions } from './types/index.d';
import persistStore from 'redux-persist/es/persistStore';

export const history: History<unknown> = createBrowserHistory();

const initialRootState = {} as IState;
const rootReducer: Reducer<IState, IUtilActions> = (state = initialRootState) => {
  return state;
}

export let initialReducers: ILoadedReducers = {
  root: rootReducer,
  router: connectRouter(history) as Reducer<RouterState<unknown>, IActions> | undefined
};

const createRootReducer = (): Reducer<ILoadedState, IActions> => {
  return combineReducers(initialReducers) as Reducer<ILoadedState, IActions>;
};

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2
}

const persistedReducer = persistReducer(persistConfig, createRootReducer);

export const store = createStore(
  persistedReducer,
  initialRootState,
  compose(
    applyMiddleware(
      createDebounce(),
      routerMiddleware(history),
      thunk as ThunkMiddleware<IState, AnyAction>,
      logger
    )
  )
);

export const persistor = persistStore(store);

export const addReducer = (currentStore: Store<ILoadedState, AnyAction>, reducers: ILoadedReducers): void => {
  initialReducers = { ...initialReducers, ...reducers };
  currentStore.replaceReducer(createRootReducer() as Reducer<ILoadedState, AnyAction>);
}