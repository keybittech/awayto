import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Grid, Typography, Button, TextField, Avatar, CardActionArea } from '@material-ui/core';

import PersonIcon from '@material-ui/icons/Person';

import { IUserProfile, IUserProfileActionTypes, IUtilActionTypes, IPreviewFile, useRedux, useApi, useAct, useComponents, useFileStore } from 'awayto';

const { SET_SNACK } = IUtilActionTypes;
const { GET_USER_PROFILE_DETAILS, POST_USER_PROFILE, PUT_USER_PROFILE } = IUserProfileActionTypes;

export function Profile(props: IProps): JSX.Element {
  const { classes } = props;

  const api = useApi();
  const act = useAct();
  const fileStore = useFileStore();
  const { AsyncAvatar, PickTheme } = useComponents();

  const util = useRedux(state => state.util);
  const user = useRedux(state => state.profile);

  const [file, setFile] = useState<IPreviewFile>();
  const [profile, setProfile] = useState<Partial<IUserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    image: ''
  });

  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 1000000,
    maxFiles: 1,
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setFile(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })).pop());
    }
  });

  useEffect(() => {
    void api(GET_USER_PROFILE_DETAILS, true);
  }, []);

  useEffect(() => () => {
    if (file) URL.revokeObjectURL(file.preview);
  }, [file]);

  useEffect(() => {
    if (user) setProfile({ ...profile, ...user });
  }, [user]);

  const deleteFile = () => {
    const { image, ...rest } = profile;
    setProfile(rest);
    setFile(undefined);
  }

  const handleSubmit = async () => {
    if (file) {
      profile.image = await fileStore?.put(file);
    }
    
    void api(profile.id ? PUT_USER_PROFILE : POST_USER_PROFILE, true, profile);
    act(SET_SNACK, { snackType: 'success', snackOn: 'Profile updated!' });
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
            <Grid item>
              <Typography variant="h6">Settings</Typography>
            </Grid>
            <Grid item>
              <PickTheme {...props} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h6">Image</Typography>
            </Grid>
            <Grid item>
              <CardActionArea style={{ padding: '12px' }}>
                {!file && !profile.image ?
                  <Grid {...getRootProps({ refKey: 'innerRef' })} container alignItems="center" direction="column">
                    <input {...getInputProps()} />
                    <Grid item>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1">Click or drag and drop to add a profile pic.</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="caption">Max size: 1MB</Typography>
                    </Grid>
                  </Grid> :
                  <Grid onClick={deleteFile} container alignItems="center" direction="column">
                    <Grid item>
                      {profile.image ? <AsyncAvatar {...props} image={profile.image} /> : file ? <Avatar src={file.preview} /> : <div />}
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" style={{ wordBreak: 'break-all' }}>{profile.image ? "Current profile image." : file ? `${file.name || ''} added.` : ''}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1">To remove, click here then submit.</Typography>
                    </Grid>
                  </Grid>
                }
              </CardActionArea>
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