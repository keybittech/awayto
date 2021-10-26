import React, { useEffect, useState, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { Dialog, IconButton, Button, Typography, CircularProgress, Checkbox } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

import { IManageUsersActionTypes, IUserProfile, useRedux, useApi } from 'awayto';

import ManageUserModal from './ManageUserModal';

const { LOCK_MANAGE_USERS, UNLOCK_MANAGE_USERS, GET_MANAGE_USERS } = IManageUsersActionTypes;

export function ManageUsers(props: IProps): JSX.Element {
  const api = useApi();
  const util = useRedux(state => state.util);
  const { users } = useRedux(state => state.manageUsers);
  const [user, setUser] = useState<IUserProfile>();
  const [selected, setSelected] = useState<IUserProfile[]>([]);
  const [toggle, setToggle] = useState(false);
  const [dialog, setDialog] = useState('');

  const updateSelections = useCallback((state: { selectedRows: IUserProfile[] }) => setSelected(state.selectedRows), []);

  const columns = useMemo(() => [
    {
      name: 'Username', selector: 'username', format: (row: IUserProfile) =>
        <Typography>{row.username} {row.locked && (<LockIcon fontSize="small" />)}</Typography>
    },
    { name: 'First Name', selector: 'firstName' },
    { name: 'Last Name', selector: 'lastName' },
    { name: 'Group', cell: (user: IUserProfile) => user.groups ? user.groups.map(r => r.name).join(', ') : '' },
    { name: 'Created', cell: (user: IUserProfile) => moment(user.createdOn).fromNow() },
  ], undefined)

  const actions = useMemo(() => {
    const { length } = selected;
    const actions = length == 1 ? [
      <IconButton key={'manage_user'} onClick={() => {
        setUser(selected.pop());
        setDialog('manage_user');
        setToggle(!toggle);
      }}>
        <CreateIcon />
      </IconButton>
    ] : [];

    return [
      ...actions,
      <IconButton key={'lock_user'} onClick={() => {
        void api(LOCK_MANAGE_USERS, true, selected.map(u => ({ id: u.id })) as IUserProfile[]);
        setToggle(!toggle);
      }}><LockIcon /></IconButton>,
      <IconButton key={'unlock_user'} onClick={() => {
        void api(UNLOCK_MANAGE_USERS, true, selected.map<string>(u => u.id));
        setToggle(!toggle);
      }}><LockOpenIcon /></IconButton>,
    ];
  }, [selected])

  useEffect(() => {
    void api(GET_MANAGE_USERS, true);
  }, []);

  // When we update a user's profile, this will refresh their state in the table once the API has updated manageUsers redux state
  useEffect(() => {
    if (users?.length && user) setUser(users?.find(u => u.id == user.id));
  }, [users]);

  return <>

    <Dialog open={dialog === 'manage_user'} fullWidth maxWidth="lg">
      <ManageUserModal {...props} editUser={user} closeModal={() => setDialog('')} />
    </Dialog>

    <DataTable
      title="Users"
      actions={<Button onClick={() => { setUser(undefined); setDialog('manage_user') }}>New</Button>}
      contextActions={actions}
      data={users ? users : []}
      theme={util.theme}
      columns={columns}
      selectableRows
      selectableRowsHighlight={true}
      selectableRowsComponent={Checkbox}
      onSelectedRowsChange={updateSelections}
      clearSelectedRows={toggle}
      pagination={true}
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 25]}
      noDataComponent={<CircularProgress />}
    />
  </>
}

export default ManageUsers;