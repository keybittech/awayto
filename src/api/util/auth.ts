import { ApiRequestAuthorizer } from 'awaytodev';

export default function authorize(params: ApiRequestAuthorizer): boolean {
  const { contentGroups, contentRoles } = params;

  if (!contentGroups && !contentRoles) return true;

  const split = params.userToken.split(':');
  const userGroup = split[0];
  const userRoles = split[1].split(',');

  let showContent = false;
  
  if (contentGroups && contentGroups.indexOf(userGroup) > -1) {
    showContent = true;
  }

  if (contentRoles) {
    userRoles.forEach(r => {
      if (contentRoles.indexOf(r) > -1) {
        showContent = true;
        return;
      }
    });
  }

  return showContent;
}