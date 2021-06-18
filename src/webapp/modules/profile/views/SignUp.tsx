import React, { useState } from 'react';

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { IUserProfile, IUserProfileActionTypes, IUtilActionTypes, useDispatch, act, cognitoPoolSignUp } from 'awayto';

const { SIGNUP_USER } = IUserProfileActionTypes;
const { HAS_CODE } = IUtilActionTypes;

export function SignUp(props: IProps & { signUpButton?: boolean }): JSX.Element {
  const { signUpButton = false } = props;

  const dispatch = useDispatch();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState<Partial<IUserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });

  return <>
    {signUpButton ?
      <Button onClick={() => props.history.push('/signup')}>Sign Up</Button> :
      <>
        <form onSubmit={async e => {
          e.preventDefault();
          if (!profile.username || !profile.email || confirmPassword.length < 8 || (password != confirmPassword)) return;

          await cognitoPoolSignUp(profile.username, password, profile.email);

          profile.signedUp = true;

          dispatch(act(SIGNUP_USER, profile as IUserProfile));
          dispatch(act(HAS_CODE, { hasSignUpCode: true }))
        }}>

          <Card>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={2}>
                    <Grid item>
                      <TextField fullWidth id="firstName" label="First Name" value={profile.firstName} name="firstName" onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
                    </Grid>

                    <Grid item>
                      <TextField fullWidth id="lastName" label="Last Name" value={profile.lastName} name="lastName" onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
                    </Grid>

                    <Grid item>
                      <TextField fullWidth id="email" label="Email" value={profile.email} name="email" onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={2}>
                    <Grid item>
                      <TextField fullWidth id="username" label="Username" value={profile.username} name="username" onChange={e => setProfile({ ...profile, username: e.target.value })} />
                    </Grid>
                    <Grid item>
                      <TextField fullWidth id="password" label="Password" value={password} name="password" onChange={e => setPassword(e.target.value)} helperText="Password must be at least 8 characters and have 1 uppercase, 1 lowercase, a special character (e.g. @^$!*), and a number." type={showPass ? 'text' : 'password'} InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPass(!showPass)}
                            >
                              {showPass ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }} />
                    </Grid>
                    <Grid item>
                      <TextField fullWidth id="confirmPassword" label="Confirm Password" value={confirmPassword} name="confirmPassword" onChange={e => setConfirmPassword(e.target.value)} error={confirmPassword !== password} type="password" />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>

              <Grid item xs={12}>
                <Grid container justify="space-between">
                  <Grid item>
                    <Button onClick={() => props.history.push('/')} color="primary">Back</Button>
                  </Grid>
                  <Grid item>
                    <Button onClick={() => dispatch(act(HAS_CODE, { hasSignUpCode: true }))} color="primary">I have a code</Button>
                    <Button type="submit" color="primary">Create</Button>
                  </Grid>
                </Grid>
              </Grid>
            </CardActions>
          </Card>


        </form>

      </>
    }
  </>
}

export default SignUp;