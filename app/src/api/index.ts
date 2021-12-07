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
import { ApiEvent, ApiModulet, ILoadedState } from 'awayto';

export const handler: Handler<ApiEvent> = async (event, context, callback) => {

  const pool = new Pool();

  const { httpMethod, pathParameters, resource, sourceIp, triggerSource } = event;

  const { awsRequestId } = context;
  const path = resource.replace('{proxy+}', pathParameters.proxy)
  const signUp = triggerSource == 'PostConfirmation_ConfirmSignUp';
  const method = signUp ? 'POST' : httpMethod;
  const proxyPath = signUp ? 'user' : path;
  const resourcePath = `${method}${proxyPath}`;
  const dev = sourceIp == 'localhost' || !sourceIp;

  if (dev) {
    if (typeof event.body == 'string')
      event.body = JSON.parse(event.body) as ILoadedState;

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

    if (event.script) {
      const { rows, rowCount } = await client.query(event.script);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({ rows, rowCount }),
        headers: { "Access-Control-Allow-Origin": "*" }
      })
    } else {

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
      const pathMatch = pathMatcher.match(resourcePath);

      if (!pathMatch)
        return errCallback(404, "404_NOT_FOUND"); // Return 404 NOT FOUND

      const { roles, inclusive = false } = Objects[pathMatch._route];

      if (roles && !authorize({ userToken: event.userAdmin, roles, inclusive }))
        return errCallback(401, "401_UNAUTHORIZED"); // Return 401 UNAUTHORIZED

      console.log('====== Method: ', httpMethod);
      console.log('====== Path: ', path);
      console.log('====== Path Parameters: ', pathParameters);
      console.log('====== Path Match Parameters: ', pathMatch._params);

      event.pathParameters = pathMatch._params;

      try {
        await auditRequest({ event, context, client });
      } catch (error) { console.log('ERROR AUDITING REQUEST, are you deploying the db?', error) }

      const response = await Objects[pathMatch._route].cmnd({ event, context, client });

      if (!response) 
        return errCallback(400, "400_BAD_REQUEST"); // Return 400 BAD REQUEST

      return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      };
    }

  } catch (error) {
    console.log('====== CRITICAL ERROR:', error)

    const { message, detail } = error as { message: string, detail: string };

    if (dev) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error: message || detail }),
        headers: { "Access-Control-Allow-Origin": "*" }
      })
    } else {
      errCallback(500, `500_INTERNAL_SERVER_ERROR ${error as string}`); // Return 500 INTERNAL SERVER ERROR
    }
    
  } finally {
    if (client)
      client.release();
  }
}

export default handler;