import { AnyAction } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkStore } from '../types';

let store: ThunkStore;

export const setStore = (newStore: ThunkStore): void => {
  store = newStore
}

/**
 * 
 * This will soon be overtaken by a useAction.
 * 
 * Typical dispatch.
 * 
 * ```
 * const dispatch = useDispatch();
 * dispatch(act(...));
 * ```
 * 
 * @category Hooks
 */
export const useDispatch = (): ThunkDispatch<ISharedState, undefined, AnyAction> => dispatch<typeof store.dispatch>();
