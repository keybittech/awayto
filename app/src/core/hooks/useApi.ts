import { useCallback } from 'react';

import { ApiResponseBody, CallApi, IActionTypes, ILoadedState, IUtilActionTypes } from '../index';
import { act } from '../actions';
import { useDispatch } from './useDispatch';
import { CognitoUserPool } from '../cognito';

const { START_LOADING, API_SUCCESS, API_ERROR, STOP_LOADING, SET_SNACK } = IUtilActionTypes;

const callApi = async <T>({ path = '', method = 'GET', body, cognitoUser }: CallApi): Promise<T> => {

  type ApiResponse = Response & Partial<ApiResponseBody> & T;
  try {
    const session = await cognitoUser.getSession();
    const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_ENDPOINT as string}${path}`, {
      method, body, headers: {
        'Content-Type': 'application/json',
        'Authorization': session.getIdToken().getToken()
      }
    } as RequestInit) as ApiResponse;

    console.log('This is whats resolved from fetch ', response, response.ok);

    if (response.ok)
      return process.env.REACT_APP_DEVELOPMENT ? await response.json() as T : await response.json() as T;

    throw `CODE ${response.awsRequestId as string} ${response.message as string}`;
  } catch (error) {
    throw error;
  }
};

const {
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_CLIENT_ID: ClientId
} = process.env;

/**
 * The `useApi` hook provides type-bound api functionality. By passing in a {@link IActionTypes} we can control the structure of the api request, and more easily handle it on the backend.
 * 
 * ```
 * import { useApi, IManageUsersActions } from 'awayto';
 * 
 * const { GET_MANAGE_USERS, GET_MANAGE_USERS_BY_ID } = IManageUsersActions;
 * 
 * const api = useApi();
 * 
 * api(GET_MANAGE_USERS);
 * ```
 * 
 * As long as we have setup our model, `GET_MANAGE_USERS` will inform the system of the API endpoint and shape of the request/response.
 * 
 * If the endpoint takes path parameters, we can pass them in as options. Pass a boolean as the second argument to show or hide a loading screen.
 *
 * ```
 * api(GET_MANAGE_USERS_BY_ID, false, { id });
 * ```
 * 
 * @category Hooks
 */
export function useApi(): (actionType: IActionTypes, load?: boolean, body?: ILoadedState, meta?: void) => Promise<unknown> {
  const dispatch = useDispatch();

  const func = useCallback(<T = unknown>(actionType: IActionTypes, load?: boolean, body?: ILoadedState, meta?: void) => {
    
    if (!UserPoolId || !ClientId)
      throw new Error('Configuration error: userPoolId missing during useApi.');

    const pool = new CognitoUserPool({ UserPoolId, ClientId });
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser)
      return Promise.reject('No user found with which to call an API.');

    const [method, path] = actionType.valueOf().split(/\/(.+)/);
    if (load) dispatch(act(START_LOADING, { isLoading: true }));

    return callApi<typeof body>({
      path,
      method,
      body: !body ? undefined : 'string' == typeof body ? body : JSON.stringify(body),
      cognitoUser
    })
      .then(response => {
        console.log('This is what is resolved to useApi: ', response);
        dispatch(act(actionType || API_SUCCESS, response, meta));
        return response as T;
      })
      .catch(e => {
        const error = (e as Error).message;
        dispatch(act(SET_SNACK, { snackType: 'error', snackOn: error }));
        dispatch(act(API_ERROR, { error }));
      }).finally(() => {
        if (load) dispatch(act(STOP_LOADING, { isLoading: false }));
      });

  }, [])

  return func;
}