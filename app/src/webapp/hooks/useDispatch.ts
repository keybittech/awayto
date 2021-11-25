import { AnyAction, Store } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';


/**
* @category Awayto Redux
*/
export type ThunkStore = Store<ISharedState, ISharedActions> & {
  dispatch: ThunkDispatch<ISharedState, undefined, ISharedActions>;
}

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