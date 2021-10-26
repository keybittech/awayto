import React, { useEffect, useMemo, useState, useCallback, ChangeEvent } from "react";
import { Card, CardContent, Grid, Typography, TextField, CardActions, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, InputAdornment } from "@material-ui/core";
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import { IGroup, IManageGroupsActionTypes, IManageRolesActionTypes, useDispatch, useApi, useRedux, act, IUtilActionTypes } from "awayto";

const { GET_MANAGE_ROLES } = IManageRolesActionTypes;
const { CHECK_GROUP_NAME, PUT_MANAGE_GROUPS, POST_MANAGE_GROUPS } = IManageGroupsActionTypes;

export function ManageGroupModal ({
  editGroup,
  closeModal = () => { return; }
}: IProps & { editGroup?: IGroup }): JSX.Element {

  const api = useApi();
  const dispatch = useDispatch();
  const { roles } = useRedux(state => state.manageRoles);
  const { isValid, needCheckName, checkedName, checkingName } = useRedux(state => state.manageGroups);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [group, setGroup] = useState<Partial<IGroup>>({
    name: '',
    ...editGroup
  });

  const formatName = useCallback((name: string) =>
    name.replaceAll(/__+/g, '_').replaceAll(/\s/g, '_').replaceAll(/[\W]+/g, '_').replaceAll(/__+/g, '_').replaceAll(/__+/g, '').toLowerCase()
    , []);

  const handleSubmit = useCallback(() => {
    const { id, name } = group;

    if (!name || !roleIds.length)
      return dispatch(act(IUtilActionTypes.SET_SNACK, {snackType: 'error', snackOn: 'Please provide a valid group name and roles.' }));

    group.name = formatName(name);
    group.roles = roles?.filter(r => roleIds.includes(r.id));

    void api(id ? PUT_MANAGE_GROUPS : POST_MANAGE_GROUPS, true, group);

    closeModal();
  }, [group, roles, roleIds]);

  useEffect(() => {
    if (!roles)
      void api(GET_MANAGE_ROLES);

    if (group.roles?.length)
      setRoleIds(group.roles.map(r => r.id))
  }, [group.roles]);

  const badName = !checkingName && !isValid && !!group?.name && formatName(group.name) == checkedName;

  const handleName = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const name = event.target.value;
    if (name.length <= 50) {
      setGroup({ ...group, name });
      dispatch(act(CHECK_GROUP_NAME, { checkedName: formatName(name), needCheckName: name != editGroup?.name }, { debounce: { time: 1000 } }))
    } 
  }, [group, setGroup])

  useEffect(() => {
    if (needCheckName && checkedName) {
      dispatch(act(CHECK_GROUP_NAME, { checkingName: true, needCheckName: false, isValid: false }));
      void api(CHECK_GROUP_NAME, true, { name: checkedName })
    }
  }, [needCheckName])

  const roleSelect = useMemo(() => roles ?
    <FormControl fullWidth variant="outlined">
      <InputLabel id="role-selection-label">Roles</InputLabel>
      <Select
        labelId="role-selection-label"
        id="role-selection"
        name="roleIds"
        value={roleIds}
        onChange={e => setRoleIds(e.target.value as string[])}
        label="Roles"
        multiple
      >
        {roles.map((b, i) => <MenuItem key={i} value={b.id}>{b.name}</MenuItem>)}
      </Select>
    </FormControl> :
    <Grid container justify="center"><CircularProgress /></Grid>
    , [roles, roleIds, setRoleIds]);

  return <>
    <Card>
      <CardContent>
        <Typography variant="button">Manage {editGroup ? editGroup.name : 'group'}</Typography>
      </CardContent>
      <CardContent>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={4} justify="space-evenly" >
              <Grid item>
                <Typography variant="h6">Group</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth id="name" label="Name" value={group.name} name="name" onChange={handleName}
                  multiline
                  helperText="Group names can only contain letters, numbers, and underscores. Max 50 characters."
                  disabled={checkingName}
                  error={badName}
                  InputProps={{
                    endAdornment: group.name && (
                      <InputAdornment
                        component={({ children }) =>
                          <Grid container style={{ width: 'calc(100% + 5em)', maxWidth: 'calc(100% + 5em)' }}>
                            {children}
                          </Grid>
                        }
                        position="start"
                      >
                        <Grid item style={{ width: '25px', height: '20px' }}>
                          {checkingName ?
                            <CircularProgress size="20px" /> : 
                            badName ? <NotInterestedIcon color="error" /> : <ArrowRightAlt />}
                        </Grid>
                        <Grid item xs style={{ wordBreak: 'break-all' }}>
                          <Typography style={{
                            backgroundColor: 'rgb(38 42 43)',
                            padding: '2px 4px',
                            border: `1px solid #666`,
                            lineHeight: '1.15em'
                          }}>
                            {formatName(group.name)}
                          </Typography>
                        </Grid>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={4} justify="space-evenly">
              <Grid item>
                <Typography variant="h6">Roles</Typography>
              </Grid>
              <Grid item xs={12}>
                {roleSelect}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container justify="flex-end">
          <Button onClick={closeModal}>Cancel</Button>
          <Button disabled={checkingName || badName} onClick={handleSubmit}>Submit</Button>
        </Grid>
      </CardActions>
    </Card>
  </>
}

export default ManageGroupModal;