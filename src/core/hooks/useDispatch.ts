import { AnyAction } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { store } from '../redux';

/**
 * @category Hooks
 */
export const useDispatch = (): ThunkDispatch<ISharedState, undefined, AnyAction> => dispatch<typeof store.dispatch>();
