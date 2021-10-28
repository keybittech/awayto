import { ApiRequestAuthorizer, getAuthorization } from 'awayto';

export default function authorize(params: ApiRequestAuthorizer): boolean {
  const { roles: requiredRoles, userToken: userRoles, inclusive } = params;
  
  console.log('gfdshgiudfsg==============s=sss')

  const { hasRole, hasGroup } = getAuthorization(userRoles, requiredRoles);

  return inclusive ? hasRole : hasGroup;
}