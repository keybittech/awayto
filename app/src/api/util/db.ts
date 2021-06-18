type BuildParamTypes = string | number;

interface BuildUpdateParams {
  [key: string]: BuildParamTypes;
}

export const buildUpdate = (params: BuildUpdateParams) => {
  const buildParams: BuildParamTypes[] = [];
  
  return {
    string: Object.keys(params).map((param, index) => `${param} = $${index + 1}`).join(', '),
    array: Object.keys(params).reduce((memo, param: BuildParamTypes) => memo.concat(params[param as keyof BuildUpdateParams]), buildParams)
  }
};

export async function asyncForEach<T>(array: T[], callback: (item: T, idx: number, arr: T[]) => Promise<void>) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}