import React, { useEffect, useState } from 'react';
import { IGroup, IRole, SiteRoles, getUserPool } from 'awayto';

export function Secure ({
  contentGroupRoles = SiteRoles.ADMIN,
  disable,
  inclusive,
  children 
}: IProps): JSX.Element {

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

        const parseGroupString = (value: string) => {
          const groups = [] as IGroup[];
          value?.split(';').forEach(set => {
            const [name, roles] = set.split(':');
            groups.push({ name, roles: roles.split(',').map(r => ({ name: r })) as IRole[] } as IGroup)
          });
          return groups;
        }

        const userGroups = parseGroupString(groupRoles);
        const contentGroups = parseGroupString(contentGroupRoles);

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