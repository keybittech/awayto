import { Context } from 'aws-lambda'
import { PoolClient } from 'pg'
import { ILoadedState } from '.'

/**
 * @category Lambda
 */
export type ApiModule = {
  [name: string]: ApiModulet;
}

/**
 * @category Lambda
 */
export type ApiModulet = {
  contentGroups?: string[];
  contentRoles?: string[];
  path: string;
  cmnd(props: ApiProps, meta?: string): LambdaApiResponse | Promise<LambdaApiResponse>;
}

/**
 * @category Lambda
 */
export type ApiProps = {
  event: ApiEvent;
  context: Context;
  client: PoolClient; 
}

/**
 * @category Lambda
 */
export type ApiEvent = {
  [name: string]: string;
  body: Record<string, string | Record<string, string>> | ILoadedState;
  userSub: string;
  httpMethod: string;
  query: Record<string, string>;
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
};

/**
 * @category Lambda
 */
export type LambdaApiResponse = {
  [name: string]: Record<string, unknown> | unknown[] | unknown;
} | ILoadedState[] | boolean

/**
 * @category Lambda
 */
export type ApiRequestAuthorizer = {
  userToken: string,
  contentGroups?: string[],
  contentRoles?: string[],
}