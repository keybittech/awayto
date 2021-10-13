import React, { useState, FormEvent } from 'react';
import { Button, Grid, Typography, TextField } from '@material-ui/core';
import { completeNewPasswordChallenge, ILogin, ILoginActionTypes, IUtilActionTypes, useRedux, useDispatch, act } from 'awayto';

const { FORCE_PASS_CHANGE_SUCCESS } = ILoginActionTypes;
const { SET_SNACK } = IUtilActionTypes;

export function ChangeNewPassword (): JSX.Element {

  const dispatch = useDispatch();
  const login = useRedux(state => state.login) as ILogin;

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || passwordConfirm !== password) return;

    const updateRes = await completeNewPasswordChallenge(password, login.username, login.session);
    
    if (updateRes) {
      dispatch(act(FORCE_PASS_CHANGE_SUCCESS, { newPassRequired: false }))
      dispatch(act(SET_SNACK, { snackType: 'success', snackOn: 'Password reset!' }))
    } else {
      dispatch(act(SET_SNACK, { snackType: 'error', snackOn: 'There was an issue completing this request. Please reload the page and try again.' }))
    }
  }

  return (
    <form onSubmit={changePassword}>
      <Grid container direction="column" alignItems="center" spacing={4}>
        <Grid item xs={12}>
          <Typography>Your account must have the password reset before logging in. Please update your password below.</Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField label="New Password" helperText="Password must be at least 6 characters and have 1 uppercase, 1 lowercase, a special character (e.g. @^$!*), and a number." fullWidth type="password" id="password" aria-describedby="password" value={password} onChange={e => setPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Confirm Password" helperText="Must match the password." fullWidth type="password" id="passwordConfirm" aria-describedby="passwordConfirm" error={passwordConfirm !== password} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            </Grid>
          </Grid>
        </Grid>

        <Button type="submit" color="primary">Change Password</Button>
      </Grid>
    </form>
  )
}

export default ChangeNewPassword;