import { useCallback } from 'react';

import { ApiResponseBody, CallApi, IActionTypes, IUtilActionTypes, IManageUsersActionTypes, IManageGroupsActionTypes, IManageRolesActionTypes, IUserProfileActionTypes } from '../types';
import { useAct } from './useAct';
import { CognitoUserPool } from '../cognito';
import { HttpResponse } from '@aws-sdk/types';
import routeMatch, { RouteMatch } from 'route-match';
const { Route, RouteCollection, PathGenerator } = routeMatch as RouteMatch;

let ApiActions = Object.assign(
  IManageUsersActionTypes,
  IManageGroupsActionTypes,
  IManageRolesActionTypes,
  IUserProfileActionTypes
) as Record<string, string>;

export function registerApi(api: IActionTypes): void {
  ApiActions = Object.assign(ApiActions, api);
}

const paths = Object.keys(ApiActions).map(key => {
  return new Route(key, ApiActions[key])
});

const routeCollection = new RouteCollection(paths);
const generator = new PathGenerator(routeCollection);

const { START_LOADING, API_SUCCESS, API_ERROR, STOP_LOADING, SET_SNACK } = IUtilActionTypes;

const callApi = async ({ path = '', method = 'GET', body, cognitoUser }: CallApi): Promise<HttpResponse> => {

  type ApiResponse = Response & Partial<ApiResponseBody> & HttpResponse;
  
  const session = await cognitoUser.getSession();
  const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_ENDPOINT as string}${path}`, {
    method, body, headers: {
      'Content-Type': 'application/json',
      'Authorization': session.getIdToken().getToken()
    }
  } as RequestInit) as ApiResponse;

  console.log('This is whats resolved from fetch ', response, response.ok);

  if (response.ok)
    return await response.json() as HttpResponse;
    
  const { error } = await response.json() as { error: string };

  const awsErr = response.awsRequestId ? `AWS Request Id: ${response.awsRequestId}` : '';
  const message = response.message ? `Message: ${response.message}` : '';
  const err = error ? `Error: ${error}` : '';

  const errStr = `${awsErr} ${message} ${err}`;

  throw errStr.length ? errStr : response;
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
export function useApi(): <T = unknown>(actionType: IActionTypes, load?: boolean, body?: T, meta?: unknown) => Promise<unknown> {
  const act = useAct();

  const func = useCallback(async <T = unknown>(actionType: IActionTypes, load?: boolean, body?: T, meta?: unknown) => {
    
    if (!UserPoolId || !ClientId)
      throw new Error('Configuration error: userPoolId missing during useApi.');

    const pool = new CognitoUserPool({ UserPoolId, ClientId });
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser)
      return Promise.reject('No user found with which to call an API.');

    const methodAndPath = actionType.valueOf().split(/\/(.+)/);
    const method = methodAndPath[0];
    let path = methodAndPath[1];

    if (load) act(START_LOADING, { isLoading: true });
    
    if (method.toLowerCase() == 'get' && body && Object.keys(body).length) {
      // Get the key of the enum from ApiActions based on the path (actionType)
      const pathKey = Object.keys(ApiActions).filter((x) => ApiActions[x] == actionType)[0];
      path = generator.generate(pathKey, body as unknown as Record<string, string>).split(/\/(.+)/)[1];
      body = undefined;
    }

    try {
      const response = await callApi({
        path,
        method,
        body: !body ? undefined : 'string' == typeof body ? body : JSON.stringify(body),
        cognitoUser
      });

      const responseBody = ('string' === typeof response.body ? JSON.parse(response.body) : response) as T;
      act(actionType || API_SUCCESS, responseBody, meta);
      return responseBody;
      
    } catch (error) { 
      act(SET_SNACK, { snackType: 'error', snackOn: 'Critical API error. Check network activity or report to system administrator.' });
      act(API_ERROR, { error: 'Critical API error. Check network activity or report to system administrator.' });
    } finally {
      if (load) act(STOP_LOADING, { isLoading: false });
    }

  }, [])

  return func;
}