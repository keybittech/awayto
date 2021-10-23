'use strict';

import { Handler } from 'aws-lambda';
import { Pool, PoolClient } from 'pg'
import routeMatch, { RouteMatch } from 'route-match';
const { Route, RouteCollection, PathMatcher } = routeMatch as RouteMatch;

import Deploy from './objects/deploy';
import Tests from './objects/tests';
import Public from './objects/public';
import Files from './objects/files';
import Users from './objects/users';
import UuidGroups from './objects/uuid_groups';
import UuidFiles from './objects/uuid_files';
import UuidNotes from './objects/uuid_notes';
import UuidRoles from './objects/uuid_roles';
import ManageRoles from './objects/manage_roles';
import ManageGroups from './objects/manage_groups';
import ManageUsers from './objects/manage_users';
import auditRequest from './util/auditor';
import authorize from './util/auth';
import { ApiEvent, ApiModule, ApiModulet } from 'awayto';

const Objects = Object.assign(
  Deploy,
  Tests,
  Public,
  Files,
  Users,
  UuidGroups,
  UuidFiles,
  UuidNotes,
  UuidRoles,
  ManageRoles,
  ManageGroups,
  ManageUsers
) as Record<string, ApiModulet>

const paths = Object.keys(Objects).map(key => {
  return new Route(key, Objects[key].path)
});
const routeCollection = new RouteCollection(paths);
const pathMatcher = new PathMatcher(routeCollection);

const pool = new Pool();

export const handler: Handler<ApiEvent> = async (event, context, callback) => {

  const { httpMethod, pathParameters, resource, sourceIp, triggerSource } = event;

  const { awsRequestId } = context;
  const path = resource.replace('{proxy+}', pathParameters.proxy)
  const signUp = triggerSource == 'PostConfirmation_ConfirmSignUp';
  const method = signUp ? 'POST' : httpMethod;
  const proxyPath = signUp ? 'user' : path;
  const resourcePath = `${method}${proxyPath}`;
  const pathMatch = pathMatcher.match(resourcePath);
  const { groups, roles } = Objects[pathMatch._route];
  const dev = sourceIp == 'localhost' || !sourceIp;

  if (dev) {
    if (typeof event.body == 'string')
      event.body = JSON.parse(event.body) as JSON;

    event.sourceIp = 'localhost';
    event.userSub = 'ecd63d7f-daab-494a-9df2-7e5290120671';
    event.userAdmin = 'group2:testrole'
  }

  const errCallback = (statusCode: number, message: string) => dev ?
    {
      statusCode,
      body: JSON.stringify({ awsRequestId, message })
    } :
    callback(null, {
      statusCode,
      body: JSON.stringify({ awsRequestId, message }),
      ...{ headers: dev ? { "Access-Control-Allow-Origin": "*" } : {} },
    });

  let client: PoolClient | undefined;

  try {

    client = await pool.connect();

    if (!pathMatch)
      return errCallback(404, "404_NOT_FOUND"); // Return 404 NOT FOUND

    if (roles && !authorize({ userToken: event.userAdmin, contentGroups: groups, contentRoles: roles }))
      return errCallback(401, "401_UNAUTHORIZED"); // Return 401 UNAUTHORIZED

    console.log('====== Method: ', httpMethod);
    console.log('====== Path: ', path);
    console.log('====== Path Parameters: ', pathParameters);
    console.log('====== Path Match Parameters: ', pathMatch._params);

    event.pathParameters = pathMatch._params;

    try {
      !dev && await auditRequest({ event, context, client });
    } catch (error) { console.log('ERROR AUDITING REQUEST, are you deploying the db?', error) }
    
    const response = await Objects[pathMatch._route].cmnd({ event, context, client });

    if (response === false) {
      return errCallback(400, "400_BAD_REQUEST"); // Return 400 BAD REQUEST
    } else {
      const payload = {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      }

      if (dev) {
        signUp ? 
        context.succeed(event) : 
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(payload),
          headers: { "Access-Control-Allow-Origin": "*" }
        }); // Return 200 SUCCESS
      } else {
        return payload
      }

      // Uncomment for local testing
      // signUp ? context.succeed(event) : callback(null, { statusCode: 200, body: JSON.stringify(response) });
    }

  } catch (error) {
    console.log('====== CRITICAL ERROR:', error)
    errCallback(500, `500_INTERNAL_SERVER_ERROR ${error as string}`); // Return 500 INTERNAL SERVER ERROR

    // callback(JSON.stringify({
    //   errorType: 'Internal Server Error',
    //   httpStatus: 500,
    //   message: error.message
    // }));
  } finally {
    if (client)
      client.release();
  }
}

export default handler;