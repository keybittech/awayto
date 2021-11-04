import React, { useEffect, useState, ReactElement } from 'react';
import { SiteRoles, getUserPool, getAuthorization, act, useAct, IUtilActionTypes, ILogoutActionTypes } from 'awayto';

const { SET_SNACK } = IUtilActionTypes;
const { LOGOUT } = ILogoutActionTypes;

declare global {
  interface IProps {
    contentGroupRoles?: SiteRoles;
    children?: ReactElement;
    inclusive?: boolean;
    disable?: boolean;
  }
}

export function Secure ({ contentGroupRoles = SiteRoles.ADMIN, disable, inclusive, children, history }: IProps): JSX.Element {

  const [hasGroup, setHasGroup] = useState<boolean>();
  const [hasRole, setHasRole] = useState<boolean>();

  const act = useAct();

  useEffect(() => {
    let ignore = false;
    async function getUser() {
      const pool = getUserPool();
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser) {
        try {
          await cognitoUser.getSession();
          const attributes = await cognitoUser.getUserAttributes();

          if (!ignore) {
            const userGroupRoles = attributes.find(a => a.Name == 'custom:admin')?.Value as string;
    
            const { hasGroup, hasRole } = getAuthorization(userGroupRoles, contentGroupRoles);
    
            setHasGroup(hasGroup);
            setHasRole(hasRole);
          }
        } catch (error) {
          if (!ignore) {
            act(SET_SNACK, { snackType: 'error', snackOn: 'Could not validate session. Please log back in.' });
            act(LOGOUT, {});
            history.push('/');
          }
        }
      }
    }
    void getUser();
    return () => {
      ignore = true;
    }
  }, [])

  const showContent = disable || inclusive ? hasRole : hasGroup;

  return <> {showContent ? children : <></>} </>
}

export default Secure;