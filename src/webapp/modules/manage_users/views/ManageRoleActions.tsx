import React, { useEffect, useMemo } from 'react';
import DataTable, { IDataTableColumn } from 'react-data-table-component';
import { Checkbox } from '@material-ui/core';

import { IManageRolesActionTypes, useApi, useRedux } from 'awayto';

const { GET_MANAGE_ROLES } = IManageRolesActionTypes;

export function ManageRoleActions (): JSX.Element {

  const api = useApi();
  const util = useRedux(state => state.util);
  const { roles = [] } = useRedux(state => state.manageRoles);

  const options = useMemo(
    () =>
      ['TURN_OFF', 'TURN_ON', 'SOME_OPTIONS_ARE_LONG', 'AND_THERE_ARE_A_LOT_OF_OPTIONS', 'SOME_OPTIONS_ARE_LONG', 'AND_THERE_ARE_A_LOT_OF_OPTIONS', 'TURN_ON', 'SOME_OPTIONS_ARE_LONG']
      .map(name => ({ name })) as {name: string}[]
    , undefined);

  const columns = useMemo(() => [
    { name: '', selector: 'name' },
    ...roles.reduce((memo, { name }) => {
      memo.push({ name, cell: ({  }) => <Checkbox /> }); // TODO Need to take action here to create groupRoleActions
      return memo;
    }, [] as IDataTableColumn<{ name: string }>[])
  ], [roles])

  useEffect(() => {
    void api(GET_MANAGE_ROLES, true);
  }, []);

  return <>
    <DataTable
      title="Action-Role Matrix"
      data={options}
      theme={util.theme}
      columns={columns}
      // customStyles={{
      //   headCells: {
      //     style: {
      //       writingMode: 'vertical-rl',
      //       transform: 'rotate(225deg)'
      //     }
      //   }
      // }}
    />
  </>
}

export default ManageRoleActions;