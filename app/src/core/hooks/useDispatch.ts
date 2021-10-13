import { AnyAction } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { getStore, history } from '../redux';

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
const store = getStore(history);
export const useDispatch = (): ThunkDispatch<ISharedState, undefined, AnyAction> => dispatch<typeof store.dispatch>();
