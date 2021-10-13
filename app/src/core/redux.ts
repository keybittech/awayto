import { History } from 'history';
import { createStore, applyMiddleware, compose, combineReducers, Reducer, Store } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import createDebounce from 'redux-debounced';
import logger from 'redux-logger';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { ILoadedReducers, ILoadedState, ThunkStore } from '.';
import persistStore from 'redux-persist/es/persistStore';
import { Persistor } from 'redux-persist/es/types';

/**
 * @category Redux
 */
export let history = {} as History<unknown>;
export const setHistory = (newHistory: History<unknown>): void => {
  history = newHistory;
}

const initialRootState = {} as ISharedState;
const rootReducer: Reducer<ILoadedState, ISharedActions> = (state = initialRootState) => {
  return state as ISharedState;
}

/**
 * @category Redux
 */
export let initialReducers: ILoadedReducers = {
  root: rootReducer
};

const createRootReducer = (): Reducer<ILoadedState, ISharedActions> => {
  return combineReducers(initialReducers);
};


const createPersistReducer = (): Reducer => {
  const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2
  }
  return persistReducer(persistConfig, createRootReducer);
}

/**
 * @category Redux
 */
export const getStore = (history: History<unknown>): ThunkStore => {
  return createStore(
    createPersistReducer(),
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
}

/**
 * @category Redux
 */
export const getPersistor = (store: Store): Persistor => {
  return persistStore(store)
}

/**
 * @category Redux
 */
export const addReducer = (store: Store, reducers: ILoadedReducers): void => {
  initialReducers = { ...initialReducers, ...reducers };
  const rootReducer = createRootReducer();
  store.replaceReducer(rootReducer as Reducer);
}