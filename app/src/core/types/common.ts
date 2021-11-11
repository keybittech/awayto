import { LocationChangeAction } from 'connected-react-router';
import { PayloadAction } from '.';

declare global {
  /**
   * @category Awayto Redux
   */
  interface ISharedState {
    util: IUtilState,
    login: ILoginState
  }

  /**
   * @category Awayto Redux
   */
  type ICommonModuleActions = IUtilActions | ILoginActions | ILogoutActions | IUuidNotesActions | IUuidFilesActions | IFileActions;

  /**
   * @category Awayto Redux
   */
  interface ISharedActionTypes {
    util: IUtilActionTypes;
    login: ILoginActionTypes;
    logout: ILogoutActionTypes;
    uuidNotes: IUuidNotesActionTypes;
    uuidFiles: IUuidFilesActionTypes;
    file: IFileActionTypes;
  }
}

/**
 * @category Awayto
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
export type IUtilState = Partial<IUtil>;


/**
 * @category Action Types
 */
export enum IUtilActionTypes {
  CLEAR_REDUX = "util/CLEAR_REDUX",
  OPEN_CONFIRM = "util/OPEN_CONFIRM",
  CLOSE_CONFIRM = "util/CLOSE_CONFIRM",
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
export type ISetThemeActionPayload = { theme: string }

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
export type ISetThemeAction = PayloadAction<IUtilActionTypes.SET_THEME, ISetThemeActionPayload>;

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
export type IUtilActions = LocationChangeAction
  | IClearReduxAction
  | IOpenConfirmAction
  | ICloseConfirmAction
  | IStartLoadingAction
  | IStopLoadingAction
  | ISetThemeAction
  | ISetSnackAction
  | ITestApiAction
  | IApiErrorAction;


/**
 * @category Awayto
 */
export type ILogin = {
  error: Error | string;
  challengeName: string;
  session: string;
  isLoggedIn: boolean;
  username: string;
}

/**
 * @category Login
 */

export type ILoginState = Partial<ILogin>;

/**
 * @category Action Types
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
export type ILoginActions = LogoutAction
  | ILoginUserAction
  | ILogoutUserAction
  | IAuthUserAction
  | IAuthUserSuccessAction
  | IAuthDenialAction
  | IResetPasswordAction
  | IForcePassChangeAction;


/**
* @category Logout
*/
export type ILogout = Record<string, unknown>

/**
 * @category Action Types
 */
export enum ILogoutActionTypes {
  LOGOUT = "LOGOUT"
}

/**
* @category Logout
*/
export type LogoutAction = PayloadAction<"LOGOUT", ILogout>;

export type ILogoutActions = LogoutAction;

/**
 * @category Awayto
 */
export type IUuidNotes = {
  id: string;
  parentUuid: string;
  note: string;
}

/**
 * @category Uuid Notes
 */
export type IUuidNotesState = Partial<IUuidNotes>;

/**
 * @category Action Types
 */
export enum IUuidNotesActionTypes {
  POST_UUID_NOTES = "POST/uuid_notes",
  PUT_UUID_NOTES = "PUT/uuid_notes",
  GET_UUID_NOTES = "GET/uuid_notes",
  GET_UUID_NOTES_BY_ID = "GET/uuid_notes/:id",
  DELETE_UUID_NOTES = "DELETE/uuid_notes/:id",
  DISABLE_UUID_NOTES = "PUT/uuid_notes/disable"
}

/**
 * @category Uuid Notes
 */
export type IPostUuidNotesAction = PayloadAction<IUuidNotesActionTypes.POST_UUID_NOTES, IUuidNotesState>;

/**
 * @category Uuid Notes
 */
export type IPutUuidNotesAction = PayloadAction<IUuidNotesActionTypes.PUT_UUID_NOTES, IUuidNotesState>;

/**
 * @category Uuid Notes
 */
export type IGetUuidNotesAction = PayloadAction<IUuidNotesActionTypes.GET_UUID_NOTES, IUuidNotesState>;

/**
 * @category Uuid Notes
 */
export type IGetUuidNotesByIdAction = PayloadAction<IUuidNotesActionTypes.GET_UUID_NOTES_BY_ID, IUuidNotesState>;

/**
 * @category Uuid Notes
 */
export type IDeleteUuidNotesAction = PayloadAction<IUuidNotesActionTypes.DELETE_UUID_NOTES, IUuidNotesState>;

/**
 * @category Uuid Notes
 */
export type IDisableUuidNotesAction = PayloadAction<IUuidNotesActionTypes.DISABLE_UUID_NOTES, IUuidNotesState[]>;

/**
 * @category Uuid Notes
 */
export type IUuidNotesActions = ILogoutUserAction
  | IPostUuidNotesAction
  | IPutUuidNotesAction
  | IGetUuidNotesAction
  | IGetUuidNotesByIdAction
  | IDeleteUuidNotesAction
  | IDisableUuidNotesAction;


/**
 * @category Awayto
 */
export type IUuidFiles = {
  id: string;
  parentUuid: string;
  fileId: string;
}

/**
 * @category Uuid Files
 */
export type IUuidFilesState = Partial<IUuidFiles>;

/**
 * @category Action Types
 */
export enum IUuidFilesActionTypes {
  POST_UUID_FILES = "POST/uuid_files",
  PUT_UUID_FILES = "PUT/uuid_files",
  GET_UUID_FILES = "GET/uuid_files",
  GET_UUID_FILES_BY_ID = "GET/uuid_files/:id",
  DELETE_UUID_FILES = "DELETE/uuid_files/:id",
  DISABLE_UUID_FILES = "PUT/uuid_files/disable"
}

/**
 * @category Uuid Files
 */
export type IPostUuidFilesAction = PayloadAction<IUuidFilesActionTypes.POST_UUID_FILES, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IPutUuidFilesAction = PayloadAction<IUuidFilesActionTypes.PUT_UUID_FILES, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IGetUuidFilesAction = PayloadAction<IUuidFilesActionTypes.GET_UUID_FILES, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IGetUuidFilesByIdAction = PayloadAction<IUuidFilesActionTypes.GET_UUID_FILES_BY_ID, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IDeleteUuidFilesAction = PayloadAction<IUuidFilesActionTypes.DELETE_UUID_FILES, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IDisableUuidFilesAction = PayloadAction<IUuidFilesActionTypes.DISABLE_UUID_FILES, IUuidFilesState>;

/**
 * @category Uuid Files
 */
export type IUuidFilesActions = ILogoutUserAction
  | IPostUuidFilesAction
  | IPutUuidFilesAction
  | IGetUuidFilesAction
  | IGetUuidFilesByIdAction
  | IDeleteUuidFilesAction
  | IDisableUuidFilesAction;


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
 * @category Action Types
 */
export enum IFileActionTypes {
  POST_FILES = "POST/files",
  PUT_FILES = "PUT/files",
  GET_FILES = "GET/files",
  GET_FILES_BY_ID = "GET/files/:id",
  DELETE_FILES = "DELETE/files/:id",
  DISABLE_FILES = "PUT/files/disable"
}

/**
 * @category File
 */
export type IPostFileAction = PayloadAction<IFileActionTypes.POST_FILES, IFileState>;
export type IPutFileAction = PayloadAction<IFileActionTypes.PUT_FILES, IFileState>;
export type IGetFileAction = PayloadAction<IFileActionTypes.GET_FILES, IFileState>;
export type IGetFileByIdAction = PayloadAction<IFileActionTypes.GET_FILES_BY_ID, IFileState>;
export type IDeleteFileAction = PayloadAction<IFileActionTypes.DELETE_FILES, IFileState>;
export type IDisableFileAction = PayloadAction<IFileActionTypes.DISABLE_FILES, IFileState>;

/**
 * @category File
 */
export type IFileActions = ILogoutUserAction
  | IPostFileAction
  | IPutFileAction
  | IGetFileAction
  | IGetFileByIdAction
  | IDeleteFileAction
  | IDisableFileAction;