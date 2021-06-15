import { Reducer } from 'redux';
import {
  IUtilActionTypes,
  IUtilState,
  IUtilActions
} from 'awaytodev';

const initialUtilState = {
  snackOn: '',
  isLoading: false,
  isConfirming: false,
  hasSignUpCode: false,
} as IUtilState;

function reduceUtil(state: IUtilState, action: IUtilActions): IUtilState {
  return { ...state, ...action.payload } as IUtilState;
}

const utilReducer: Reducer<IUtilState, IUtilActions> = (state = initialUtilState, action) => {
  switch (action.type) {
    case IUtilActionTypes.OPEN_CONFIRM:
    case IUtilActionTypes.CLOSE_CONFIRM:
    case IUtilActionTypes.START_LOADING:
    case IUtilActionTypes.STOP_LOADING:
    case IUtilActionTypes.SET_THEME:
    case IUtilActionTypes.SET_SNACK:
    case IUtilActionTypes.TEST_API:
    case IUtilActionTypes.API_ERROR:
      return reduceUtil(state, action);
    default:
      return state;
  }
};

export default utilReducer;