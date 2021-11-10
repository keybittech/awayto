import React, { useState, FormEvent } from 'react';
import { Button, Grid, Typography, TextField } from '@material-ui/core';

import { useRedux } from 'awayto-hooks';

export function ChangeNewPassword (): JSX.Element {

  const login = useRedux(state => state.login);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 1 || passwordConfirm !== password) return;
    
    // if (login && login.cognitoUser && login.authenticator) {
    //   login.authenticator.onSuccess = function () {
    //     export const completeLoginPasswordChange = (): ThunkResult => () => {
    //       store.dispatch(createPayloadAction(ILoginActionTypes.FORCE_PASS_CHANGE_SUCCESS, { newPassRequired: false }));
    //       store.dispatch(createPayloadAction(IUtilActionTypes.SET_SNACK, { snackType: 'success', snackOn: 'Password reset!' }))
    //     }
    //     dispatch(completeLoginPasswordChange());
    //   }
    //   login.authenticator.onFailure = () => {
    //     dispatch(setSnack('error', 'There was an issue completing this request. Please reload the page and try again.'))
    //   }
    //   login.cognitoUser.completeNewPasswordChallenge(password, undefined, login.authenticator);
    // }
  }

  return (
    <form onSubmit={changePassword}>
      <Grid container direction="column" alignItems="center" spacing={7}>
        <Grid item md={5}>
          <Typography>Your account must have the password reset before logging in. Please update your password below.</Typography>

        </Grid>

        <Grid item md={5}>
          <TextField label="New Password" helperText="Password must be at least 6 characters and have 1 uppercase, 1 lowercase, a special character (e.g. @^$!*), and a number." fullWidth type="password" id="password" aria-describedby="password" value={password} onChange={e => setPassword(e.target.value)} />
          <TextField label="Confirm Password" helperText="Must match the password." fullWidth type="password" id="passwordConfirm" aria-describedby="passwordConfirm" error={passwordConfirm !== password} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
        </Grid>

        <Button type="submit" color="primary">Change Password</Button>
      </Grid>
    </form>
  )
}

export default ChangeNewPassword;