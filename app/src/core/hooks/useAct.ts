import { act, ILoadedState } from 'awayto';
import { useDispatch } from 'react-redux';
import { IActionTypes } from '../types';

/**
 * `useAct` is a wrapper for dispatching actions. Give it an action type (i.e. SET_SNACK), a loader boolean, and the action payload if necessary.
 * 
 * @category Hooks
 */
export function useAct(): (actionType: IActionTypes, state: ILoadedState) => void {
  const dispatch = useDispatch();
  return (actionType: IActionTypes, state: ILoadedState) => {
    dispatch(act(actionType, state));
  };
}

export default useAct;