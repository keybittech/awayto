import { AnyAction } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkStore } from 'awayto';

let store: ThunkStore;

export const setStore = (newStore: ThunkStore): void => {
  store = newStore
}

/**
 * 
 * Deprecated: Use the `useAct` hook instead!
 * 
 * Typical dispatch.
 * 
 * ```
 * const dispatch = useDispatch();
 * dispatch(act(...));
 * ```
 * 
 * @deprecated
 * @category Hooks
 */
export const useDispatch = (): ThunkDispatch<ISharedState, undefined, AnyAction> => dispatch<ThunkDispatch<ISharedState, undefined, AnyAction>>();