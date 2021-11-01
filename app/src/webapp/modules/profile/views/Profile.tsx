import React, { useState, useEffect, createRef } from 'react';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { Grid, Typography, Button, TextField, Avatar, CardActionArea, FormControlLabel, Switch } from '@material-ui/core';

import PersonIcon from '@material-ui/icons/Person';

import { DropFile, IUserProfile, IUserProfileActionTypes, useRedux, useDispatch, IUtilActionTypes, useApi, act, useComponents } from 'awayto';

const { SET_SNACK, SET_THEME } = IUtilActionTypes;
const { GET_USER_PROFILE_DETAILS, POST_USER_PROFILE, PUT_USER_PROFILE } = IUserProfileActionTypes;

export function Profile (props: IProps): JSX.Element {
  const { classes } = props;
  
  const api = useApi();
  const dispatch = useDispatch();
  // const login = useRedux(state => state.login);
  const util = useRedux(state => state.util);
  const user = useRedux(state => state.profile);
  const { AsyncAvatar } = useComponents();

  const dropzoneRef = createRef<DropzoneRef>();

  const [profile, setProfile] = useState<Partial<IUserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    image: ''
  });

  const [file, setFile] = useState<DropFile>();
  const maxFileSize = 1000000;

  useEffect(() => {
    void api(GET_USER_PROFILE_DETAILS, true);
  }, []);

  useEffect(() => {
    if (user) setProfile({ ...profile, ...user });
  }, [user]);

  const deleteFile = () => {
    if (file) {
      setFile(undefined);
    }
  }

  const handleSubmit = () => {
    if (profile) {
      void api(profile.id ? PUT_USER_PROFILE : POST_USER_PROFILE, true, profile);
      dispatch(act(SET_SNACK, { snackType: 'success', snackOn: 'Profile updated!' }));
    }
  }

  return <div>
    {profile && util && (
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h6">Profile</Typography>
            </Grid>
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
        <Grid item>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h6">Image</Typography>
            </Grid>
            <Grid item>
              <CardActionArea>
                {!file && !profile.image ?

                  <Dropzone ref={dropzoneRef} onDrop={(acceptedFiles, fileRejections) => {
                    if (fileRejections.length && fileRejections[0].errors[0].message) {
                      dispatch(act(SET_SNACK, { snackType: 'error', snackOn: 'File size is too big. Please select a file under 1MB.' }));
                    } else {
                      setFile(acceptedFiles.pop() as DropFile);
                    }
                  }} accept="image/*" maxSize={maxFileSize}>

                    {({ getRootProps, getInputProps }) => (
                      <Grid {...getRootProps} container direction="column" alignItems="center" justifyContent="space-evenly" style={{ flexGrow: 1 }} className={classes.dropzone}>
                        <input {...getInputProps()} />
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="subtitle1">Click or drag and drop to add a profile pic.</Typography>
                        <Typography variant="caption">Max size: 1MB</Typography>
                      </Grid>
                    )}
                  </Dropzone> : <Grid container direction="column" alignItems="center" justifyContent="space-evenly" style={{ flexGrow: 1 }} className={classes.dropzone} onClick={deleteFile}>
                    {profile.image && AsyncAvatar ? <AsyncAvatar {...props} image={profile.image} /> : file ? <Avatar src={file.preview} /> : <div />}
                    <Typography variant="h6" style={{ wordBreak: 'break-all' }}>{profile.image ? "Current profile image." : file ? `${file.name || ''} added.` : ''}</Typography>
                    <Typography variant="subtitle1">Click to remove, then submit.</Typography>
                  </Grid>
                }
              </CardActionArea>
            </Grid>
            <Grid item>
              <Typography variant="h6">Settings</Typography>
            </Grid>
            <Grid item>
              <FormControlLabel
                value="darkmode"
                control={
                  <Switch onClick={() => dispatch(act(SET_THEME, { theme: util.theme === 'dark' ? 'light' : 'dark'}))} checked={util.theme === 'dark'} color="primary" />
                }
                label="Dark Mode"
                labelPlacement="end"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Button className={classes.red} onClick={handleSubmit}>Submit</Button>
        </Grid>
      </Grid>
    )}
  </div>
}

export default Profile;