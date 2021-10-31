import React, { useEffect, useState, ReactElement } from 'react';
import { SiteRoles, getUserPool, getAuthorization, act, useDispatch, IUtilActionTypes, ILogoutTypes } from 'awayto';

const { SET_SNACK } = IUtilActionTypes;
const { LOGOUT } = ILogoutTypes;

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

  const dispatch = useDispatch();

  useEffect(() => {
    async function getUser() {
      const pool = getUserPool();
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser) {
        try {
          await cognitoUser.getSession();

          const attributes = await cognitoUser.getUserAttributes();
          const userGroupRoles = attributes.find(a => a.Name == 'custom:admin')?.Value as string;
  
          const { hasGroup, hasRole } = getAuthorization(userGroupRoles, contentGroupRoles);
  
          setHasGroup(hasGroup);
          setHasRole(hasRole);
        } catch (error) {
          dispatch(act(SET_SNACK, { snackType: 'error', snackOn: 'Could not validate session. Please log back in.' }));
          dispatch(act(LOGOUT, null));
          history.push('/');
        }

        // const userGroups = parseGroupString(groupRoles); //custom:admin
        // const contentGroups = parseGroupString(contentGroupRoles); //customGroupRoles string

        // contentGroups.forEach(cg => {
        //   const userGroup = userGroups.find(ug => ug.name == cg.name);

        //   if (userGroup) {
        //     setHasGroup(true)

        //     cg.roles.forEach(cgr => {
        //       if (userGroup.roles.map(ugr => ugr.name).includes(cgr.name))
        //         setHasRole(true);
        //     })
        //   }
        // })
      }
    }
    void getUser();
  }, [])

  const showContent = disable || inclusive ? hasRole : hasGroup;

  return <> {showContent ? children : <></>} </>
}

export default Secure;