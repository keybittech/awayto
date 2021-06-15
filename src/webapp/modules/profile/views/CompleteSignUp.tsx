import React, { useState } from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';

import { useDispatch, useRedux, IUtilActionTypes, act, getUserPool, CognitoUser } from 'awaytodev';

const { SET_SNACK, HAS_CODE } = IUtilActionTypes;

export function CompleteSignUp (props: Props): JSX.Element {

  const dispatch = useDispatch();
  const user = useRedux(state => state.profile);

  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');

  return <>
    <form onSubmit={(e: React.FormEvent) => {
      e.preventDefault();

      if (code.length != 6 || user.signedUp && !username) return;

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: getUserPool()
      });

      cognitoUser.confirmSignUp(code, false)
        .then(() => {
          dispatch(act(SET_SNACK, { snackType: 'success', snackOn: 'User confirmed! You may now log in.' }));
          dispatch(act(HAS_CODE, { hasSignUpCode: false }))
          props.history.push('/');
        }).catch(err => {
          dispatch(act(SET_SNACK, { snackType: 'info', snackOn: err as string }));
        });
    }}>
      <Grid container direction="column" alignItems="center" spacing={5}>

        <Grid item xs={12}>
          {user.signedUp ?
            <Typography>A code has been sent to your email. Retrieve the code and enter it below to confirm your account.</Typography> :
            <TextField helperText="Enter the username you used when signing up." fullWidth id="username" label="Username" value={username} name="username" onChange={e => setUsername(e.target.value)} />
          }
        </Grid>

        <Grid item xs={12}>
          <TextField helperText="Enter the 6 digit code you received in your email." fullWidth id="code" label="Code" value={code} name="code" onChange={e => setCode(e.target.value)} />
        </Grid>

        <Grid item style={{ width: '100%' }} xs={user.signedUp ? 6 : 12}>
          <Grid container justify="space-between">
            <Button onClick={() => dispatch(act(HAS_CODE, { hasSignUpCode: false }))} color="primary">Back</Button>
            <Button type="submit" color="primary">Submit Code</Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  </>
}

export default CompleteSignUp;