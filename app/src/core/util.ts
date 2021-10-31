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
    groups.push({ name, roles: roles.split(',').map(r => ({ name: r.trim() })) as IRole[] } as IGroup)
  });
  return groups;
}


/**
 * @category Util
 */
 export const getAuthorization = (ug: string, rg: string): { hasGroup: boolean, hasRole: boolean } => {
  const userGroups = parseGroupString(ug); // IGroup[]
  const requiredGroups = parseGroupString(rg); // IGroup[]

  const match = requiredGroups.filter(rg => userGroups.map(ug => ug.name).includes(rg.name)) || [];
  const hasGroup = !!match.length;
  const hasRole = match.some(m => {
    return !!m.roles.filter(mr => userGroups.find(g => g.name == m.name)?.roles.map(r => r.name).includes(mr.name)).length
  });

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