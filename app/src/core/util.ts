import { IGroup, IRole } from "awayto";

/**
 * @category Util
 */
export async function asyncForEach<T>(array: T[], callback: (item: T, idx: number, arr: T[]) => Promise<void>): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * @category Util
 */
export const parseGroupString = (value: string): IGroup[] => {
  const groups = [] as IGroup[];
  value?.split(';').forEach(set => {
    const [name, roles] = set.split(':');
    groups.push({ name, roles: roles.split(',').map(r => ({ name: r })) as IRole[] } as IGroup)
  });
  return groups;
}


/**
 * @category Util
 */
 export const getAuthorization = (ug: string, rg: string): Record<string, boolean> => {
  const userGroups = parseGroupString(ug); // IGroup[]
  const requiredGroups = parseGroupString(rg); // IGroup[]

  console.log('============================== grops', userGroups, requiredGroups);

  const match = userGroups.filter(ug => !requiredGroups.map(cg => cg.name).includes(ug.name)) || [];
  const hasGroup = !!match.length;
  const hasRole = match.some(ug => ug.roles.some(r => requiredGroups.find(rg => rg.name == ug.name)?.roles.map(r => r.name).includes(r.name)))

  console.log('i have the roles', hasGroup, hasRole);

  return {
    hasGroup,
    hasRole
  }
}

export default {
  asyncForEach,
  parseGroupString,
  getAuthorization
}