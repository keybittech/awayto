import React, { useState } from "react";
import { Card, CardContent, Grid, Typography, TextField, CardActions, Button } from "@material-ui/core";

import { act, IManageRolesActionTypes, IRole, IUtilActionTypes, useApi, useDispatch } from "awayto";
import { useCallback } from "react";

const { POST_MANAGE_ROLES, PUT_MANAGE_ROLES } = IManageRolesActionTypes;

export function ManageRoleModal ({
  editRole,
  closeModal = () => { return; }
}: IProps & { editRole?: IRole }): JSX.Element {

  const api = useApi();
  const dispatch = useDispatch();
  const [role, setRole] = useState<Partial<IRole>>({
    name: '',
    ...editRole
  });
  
  const handleSubmit = useCallback(() => {
    const { id, name } = role;

    if (!name) 
      return dispatch(act(IUtilActionTypes.SET_SNACK, {snackType: 'error', snackOn: 'Groups must have a name.' }));

    void api(id ? PUT_MANAGE_ROLES : POST_MANAGE_ROLES, false, role);

    closeModal();
  }, [role]);

  return <>
    <Card>
      <CardContent>
        <Typography variant="button">Manage role</Typography>
      </CardContent>
      <CardContent>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12}>
            <Grid container direction="column" spacing={4} justify="space-evenly" >
              <Grid item>
                <Typography variant="h6">Role</Typography>
              </Grid>
              <Grid item>
                <TextField fullWidth id="name" label="Name" value={role.name} name="name" onChange={e => setRole({ ...role, name: e.target.value })} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container justify="space-between">
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </Grid>
      </CardActions>
    </Card>
  </>
}

export default ManageRoleModal;