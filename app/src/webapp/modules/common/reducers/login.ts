import { Reducer } from 'redux';
import {
  ILoginState,
  ILoginActions,
  ILoginActionTypes,
  ILogoutActionTypes
} from 'awayto';

const initialLoginState: ILoginState = {
  username: '',
  isLoggedIn: false,
  session: '',
  challengeName: ''
};

function reduceLogin(state: ILoginState, action: ILoginActions): ILoginState {
  return { ...state, ...action.payload };
}

const loginReducer: Reducer<ILoginState, ILoginActions> = (state = initialLoginState, action) => {
  switch (action.type) {
    case ILogoutActionTypes.LOGOUT:
      return  { ...initialLoginState, ...{ isLoggedIn: false } };
    case ILoginActionTypes.LOGIN_USER:
    case ILoginActionTypes.AUTH_USER:
    case ILoginActionTypes.AUTH_SUCCESS:
    case ILoginActionTypes.AUTH_DENIAL:
    case ILoginActionTypes.RESET_PASSWORD:
    case ILoginActionTypes.FORCE_PASS_CHANGE_SUCCESS:
      return reduceLogin(state, action);
    default:
      return state;
  }
};

export default loginReducer;