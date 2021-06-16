import { LocationChangeAction } from 'connected-react-router';
import { PayloadAction } from '.';

declare global {
  /**
   * @category Awayto
   */
  export interface ISharedState {
    util: IUtilState,
    login: ILoginState
  }

  /**
   * @category Awayto
   */
  export type ICommonModuleActions = IUtilActions | ILoginActions;

  /**
   * @category Awayto
   */
  export interface ISharedActionTypes {
    util: IUtilActionTypes;
    login: ILoginActionTypes;
    uuidNotes: IUuidNotesActionTypes;
    uuidFiles: IUuidFilesActionTypes;
    file: IFileActionTypes;
  }
}

/**
 * @category Util
 */
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


/**
 * @category Util
 */
export type IUtilState = IUtil;


/**
 * @category Util
 */
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


/**
 * @category Util
 */
export type IUtilLoadingActionPayload = { isLoading: boolean };
/**
 * @category Util
 */
export type IApiErrorActionPayload = { error: string }

/**
 * @category Util
 */
export type IClearReduxAction = PayloadAction<IUtilActionTypes.CLEAR_REDUX, null>;

/**
 * @category Util
 */
export type IOpenConfirmAction = PayloadAction<IUtilActionTypes.OPEN_CONFIRM, { isConfirming: boolean, message: string, action: Promise<void> }>;

/**
 * @category Util
 */
export type ICloseConfirmAction = PayloadAction<IUtilActionTypes.CLOSE_CONFIRM, { isConfirming: boolean, message: string }>;

/**
 * @category Util
 */
export type IStartLoadingAction = PayloadAction<IUtilActionTypes.START_LOADING, IUtilLoadingActionPayload>;

/**
 * @category Util
 */
export type IStopLoadingAction = PayloadAction<IUtilActionTypes.STOP_LOADING, IUtilLoadingActionPayload>;

/**
 * @category Util
 */
export type ISetThemeAction = PayloadAction<IUtilActionTypes.SET_THEME, { theme: string }>;

/**
 * @category Util
 */
export type ISetSnackAction = PayloadAction<IUtilActionTypes.SET_SNACK, { snackType: string, snackOn: string }>;

/**
 * @category Util
 */
export type ITestApiAction = PayloadAction<IUtilActionTypes.TEST_API, { test: { objectUrl?: Record<string, string> | string } }>;

/**
 * @category Util
 */
export type IApiErrorAction = PayloadAction<IUtilActionTypes.API_ERROR, IApiErrorActionPayload>;

/**
 * @category Util
 */
export type IApiSuccessAction = PayloadAction<IUtilActionTypes.API_SUCCESS, void>;

/**
 * @category Util
 */
export type IHasSignUpCodeAction = PayloadAction<IUtilActionTypes.HAS_CODE, IUtil>;

/**
 * @category Util
 */
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


/**
 * @category Login
 */
export type ILogin = {
  bootstrapped: boolean;
  error: Error | string;
  newPassRequired: boolean;
  username: string;
}

/**
 * @category Login
 */

export type ILoginState = Partial<ILogin>;

/**
 * @category Login
 */
export enum ILoginActionTypes {
  LOGIN_USER = "login/LOGIN_USER",
  LOGOUT_USER = "login/LOGOUT_USER",
  AUTH_USER = "login/AUTH_USER",
  AUTH_SUCCESS = "login/AUTH_SUCCESS",
  AUTH_DENIAL = "login/AUTH_DENIAL",
  RESET_PASSWORD = "login/RESET_PASSWORD",
  FORCE_PASS_CHANGE_SUCCESS = "login/FORCE_PASS_CHANGE_SUCCESS"
}

/**
 * @category Login
 */
export type ILoginUserAction = PayloadAction<ILoginActionTypes.LOGIN_USER, ILoginState>;

/**
 * @category Login
 */
export type ILogoutUserAction = PayloadAction<ILoginActionTypes.LOGOUT_USER, ILoginState>;

/**
 * @category Login
 */
export type IAuthUserAction = PayloadAction<ILoginActionTypes.AUTH_USER, ILoginState>;

/**
 * @category Login
 */
export type IAuthUserSuccessAction = PayloadAction<ILoginActionTypes.AUTH_SUCCESS, ILoginState>;

/**
 * @category Login
 */
export type IAuthDenialAction = PayloadAction<ILoginActionTypes.AUTH_DENIAL, ILoginState>;

/**
 * @category Login
 */
export type IResetPasswordAction = PayloadAction<ILoginActionTypes.RESET_PASSWORD, ILoginState>;

/**
 * @category Login
 */
export type IForcePassChangeAction = PayloadAction<ILoginActionTypes.FORCE_PASS_CHANGE_SUCCESS, ILoginState>;

/**
 * @category Login
 */
export type ILoginActions = ILoginUserAction
  | ILogoutUserAction
  | IAuthUserAction
  | IAuthUserSuccessAction
  | IAuthDenialAction
  | IResetPasswordAction
  | IForcePassChangeAction;


/**
 * @category Notes
 */
export type IUuidNotes = {
  id: string;
  parentUuid: string;
  note: string;
}

/**
 * @category Notes
 */
export type IUuidNotesState = Partial<IUuidNotes>;

/**
 * @category Notes
 */
export enum IUuidNotesActionTypes {
  UUID_NOTES = "common/UUID_NOTES"
}

/**
 * @category Notes
 */
export type IUuidNotesUserAction = PayloadAction<IUuidNotesActionTypes.UUID_NOTES, IUuidNotesState>;

/**
 * @category Notes
 */
export type IUuidNotesActions = IUuidNotesUserAction;


/**
 * @category File
 */
export type IUuidFiles = {
  id: string;
  parentUuid: string;
  fileId: string;
}

/**
 * @category File
 */
export type IUuidFilesState = Partial<IUuidFiles>;

/**
 * @category File
 */
export enum IUuidFilesActionTypes {
  UUID_FILES = "common/UUID_FILES"
}

/**
 * @category File
 */
export type IUuidFilesUserAction = PayloadAction<IUuidFilesActionTypes.UUID_FILES, IUuidFilesState>;

/**
 * @category File
 */
export type IUuidFilesActions = IUuidFilesUserAction;


/**
 * @category File
 */
export type IFile = {
  id: string;
  name: string;
  fileTypeId: string;
  location: string;
}

/**
 * @category File
 */
export type IFileState = Partial<IFile>;

/**
 * @category File
 */
export enum IFileActionTypes {
  FILES = "common/FILES"
}

/**
 * @category File
 */
export type IFileUserAction = PayloadAction<IFileActionTypes.FILES, IFileState>;

/**
 * @category File
 */
export type IFileActions = IFileUserAction;