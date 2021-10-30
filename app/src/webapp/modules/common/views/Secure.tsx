import React, { useEffect, useState, ReactElement } from 'react';
import { SiteRoles, getUserPool, parseGroupString } from 'awayto';

export function Secure ({ contentGroupRoles = SiteRoles.ADMIN, disable, inclusive, children }: IProps & {
  contentGroupRoles?: SiteRoles;
  children?: ReactElement;
  inclusive?: boolean;
  disable?: boolean;
}): JSX.Element {

  const [hasGroup, setHasGroup] = useState<boolean>();
  const [hasRole, setHasRole] = useState<boolean>();

  useEffect(() => {
    async function getUser() {
      const pool = getUserPool();
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser) {
        await cognitoUser.getSession();
        const attributes = await cognitoUser.getUserAttributes();
        const groupRoles = attributes.find(a => a.Name == 'custom:admin')?.Value as string;

        const userGroups = parseGroupString(groupRoles); //custom:admin
        const contentGroups = parseGroupString(contentGroupRoles); //customGroupRoles string

        contentGroups.forEach(cg => {
          const userGroup = userGroups.find(ug => ug.name == cg.name);

          if (userGroup) {
            setHasGroup(true)

            cg.roles.forEach(cgr => {
              if (userGroup.roles.map(ugr => ugr.name).includes(cgr.name))
                setHasRole(true);
            })
          }
        })
      }
    }
    void getUser();
  }, [])

  const showContent = disable || inclusive ? hasRole : hasGroup;

  return <> {showContent ? children : <></>} </>
}

export default Secure;