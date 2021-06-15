import { LocationChangeAction } from 'connected-react-router';
import { PayloadAction } from '.';

declare global {
  export interface ISharedState {
    util: IUtilState,
    login: ILoginState
  }
  // ISharedActions
  export type ICommonModuleActions = IUtilActions | ILoginActions;
  export interface ISharedActionTypes {
    util: IUtilActionTypes;
    login: ILoginActionTypes;
    uuidNotes: IUuidNotesActionTypes;
    uuidFiles: IUuidFilesActionTypes;
    file: IFileActionTypes;
  }
}

export type IUtil = {
  action(): Promise<void>;
  isConfirming: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error: Error | string;
  message: string;
  snackType: 'success' | 'info' | 'warning' | 'error';
  snackOn: string;
  perPage: number;
  theme: string;
  hasSignUpCode: boolean;
  test: { objectUrl: string };
}

export type IUtilState = IUtil;

export enum IUtilActionTypes {
  CLEAR_REDUX = "util/CLEAR_REDUX",
  OPEN_CONFIRM = "util/OPEN_CONFIRM",
  CLOSE_CONFIRM = "util/CLOSE_CONFIRM",
  HAS_CODE = "util/HAS_CODE",
  START_LOADING = "util/START_LOADING",
  STOP_LOADING = "util/STOP_LOADING",
  SET_THEME = "util/SET_THEME",
  SET_SNACK = "util/SET_SNACK",
  TEST_API = "util/TEST_API",
  API_ERROR = "util/API_ERROR",
  API_SUCCESS = "util/API_SUCCESS"
}

export type IUtilLoadingActionPayload = { isLoading: boolean };
export type IApiErrorActionPayload = { error: string }

export type IClearReduxAction = PayloadAction<IUtilActionTypes.CLEAR_REDUX, null>;
export type IOpenConfirmAction = PayloadAction<IUtilActionTypes.OPEN_CONFIRM, { isConfirming: boolean, message: string, action: Promise<void> }>;
export type ICloseConfirmAction = PayloadAction<IUtilActionTypes.CLOSE_CONFIRM, { isConfirming: boolean, message: string }>;
export type IStartLoadingAction = PayloadAction<IUtilActionTypes.START_LOADING, IUtilLoadingActionPayload>;
export type IStopLoadingAction = PayloadAction<IUtilActionTypes.STOP_LOADING, IUtilLoadingActionPayload>;
export type ISetThemeAction = PayloadAction<IUtilActionTypes.SET_THEME, { theme: string }>;
export type ISetSnackAction = PayloadAction<IUtilActionTypes.SET_SNACK, { snackType: string, snackOn: string }>;
export type ITestApiAction = PayloadAction<IUtilActionTypes.TEST_API, { test: { objectUrl?: Record<string, string> | string } }>;
export type IApiErrorAction = PayloadAction<IUtilActionTypes.API_ERROR, IApiErrorActionPayload>;
export type IApiSuccessAction = PayloadAction<IUtilActionTypes.API_SUCCESS, void>;
export type IHasSignUpCodeAction = PayloadAction<IUtilActionTypes.HAS_CODE, IUtil>;

export type IUtilActions = LocationChangeAction
  | IClearReduxAction
  | IOpenConfirmAction
  | ICloseConfirmAction
  | IStartLoadingAction
  | IStopLoadingAction
  | ISetThemeAction
  | ISetSnackAction
  | ITestApiAction
  | IApiErrorAction
  | IHasSignUpCodeAction;


export type ILogin = {
  bootstrapped: boolean;
  error: Error | string;
  newPassRequired: boolean;
  username: string;
}

export type ILoginState = Partial<ILogin>;

export enum ILoginActionTypes {
  LOGIN_USER = "login/LOGIN_USER",
  LOGOUT_USER = "login/LOGOUT_USER",
  AUTH_USER = "login/AUTH_USER",
  AUTH_SUCCESS = "login/AUTH_SUCCESS",
  AUTH_DENIAL = "login/AUTH_DENIAL",
  RESET_PASSWORD = "login/RESET_PASSWORD",
  FORCE_PASS_CHANGE_SUCCESS = "login/FORCE_PASS_CHANGE_SUCCESS"
}

export type ILoginUserAction = PayloadAction<ILoginActionTypes.LOGIN_USER, ILoginState>;
export type ILogoutUserAction = PayloadAction<ILoginActionTypes.LOGOUT_USER, ILoginState>;
export type IAuthUserAction = PayloadAction<ILoginActionTypes.AUTH_USER, ILoginState>;
export type IAuthUserSuccessAction = PayloadAction<ILoginActionTypes.AUTH_SUCCESS, ILoginState>;
export type IAuthDenialAction = PayloadAction<ILoginActionTypes.AUTH_DENIAL, ILoginState>;
export type IResetPasswordAction = PayloadAction<ILoginActionTypes.RESET_PASSWORD, ILoginState>;
export type IForcePassChangeAction = PayloadAction<ILoginActionTypes.FORCE_PASS_CHANGE_SUCCESS, ILoginState>;

export type ILoginActions = ILoginUserAction
  | ILogoutUserAction
  | IAuthUserAction
  | IAuthUserSuccessAction
  | IAuthDenialAction
  | IResetPasswordAction
  | IForcePassChangeAction;


export type IUuidNotes = {
  id: string;
  parentUuid: string;
  note: string;
}

export type IUuidNotesState = Partial<IUuidNotes>;

export enum IUuidNotesActionTypes {
  UUID_NOTES = "common/UUID_NOTES"
}

export type IUuidNotesUserAction = PayloadAction<IUuidNotesActionTypes.UUID_NOTES, IUuidNotesState>;

export type IUuidNotesActions = IUuidNotesUserAction;


export type IUuidFiles = {
  id: string;
  parentUuid: string;
  fileId: string;
}

export type IUuidFilesState = Partial<IUuidFiles>;

export enum IUuidFilesActionTypes {
  UUID_FILES = "common/UUID_FILES"
}

export type IUuidFilesUserAction = PayloadAction<IUuidFilesActionTypes.UUID_FILES, IUuidFilesState>;

export type IUuidFilesActions = IUuidFilesUserAction;


export type IFile = {
  id: string;
  name: string;
  fileTypeId: string;
  location: string;
}

export type IFileState = Partial<IFile>;

export enum IFileActionTypes {
  FILES = "common/FILES"
}

export type IFileUserAction = PayloadAction<IFileActionTypes.FILES, IFileState>;

export type IFileActions = IFileUserAction;