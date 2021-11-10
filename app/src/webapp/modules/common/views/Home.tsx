import React, { useState, useCallback } from 'react';
import { Button, Input, Grid, Typography, TextField, InputAdornment, FormControl } from '@material-ui/core';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';

import { IGroup, IUtilActionTypes, SiteRoles, IManageRolesActionTypes } from 'awayto';
import { useApi, useRedux, useComponents } from 'awayto-hooks';

const { GET_MANAGE_ROLES } = IManageRolesActionTypes;
const { TEST_API } = IUtilActionTypes;

export function Home(props: IProps): JSX.Element {
  const { Secure } = useComponents();
  const api = useApi();
  const { test } = useRedux(state => state.util);
  const users = useRedux(state => state.manageUsers);
  const [getPath, setGetPath] = useState('manage/users');
  const [postPath, setPostPath] = useState('public');
  const [body, setBody] = useState('{}');
  const [file, setFile] = useState('');
  const [group, setGroup] = useState<Partial<IGroup>>({
    name: ''
  });

  const handleName = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const name = event.target.value;
    name.length <= 50 && setGroup({ ...group, name })
  }, [group, setGroup])

  const formatName = useCallback((name: string) =>
    name.replaceAll(/__+/g, '_').replaceAll(/\s/g, '_').replaceAll(/[\W]+/g, '_').replaceAll(/__+/g, '_').replaceAll(/__+/g, '').toLowerCase()
    , []);

  return <>
    <Secure {...props} inclusive contentGroupRoles={SiteRoles.ADMIN}>
      <Grid container>
        <Grid item xs={12}>
          <Grid container direction="column" spacing={4} justifyContent="space-evenly" >
            <Grid item>
              <Typography variant="h6">Group</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <Input type="text" value={getPath} onChange={e => setGetPath(e.target.value)} />

              </FormControl>
              <TextField
                fullWidth id="name" label="Name" value={group.name} name="name" onChange={handleName}
                multiline
                InputProps={{
                  endAdornment: group.name && (
                    <InputAdornment
                      component={({ children }) =>
                        <Grid container alignItems="center" style={{ width: 'calc(100% + 5em)', maxWidth: 'calc(100% + 5em)' }}>
                          {children}
                        </Grid>
                      }
                      position="start"
                      style={{ display: 'flex' }}
                    >
                      <Grid item ><ArrowRightAlt /></Grid>
                      <Grid item xs style={{ wordBreak: 'break-all' }}>
                        <Typography style={{
                          backgroundColor: 'rgb(38 42 43)',
                          padding: '0 4px',
                          border: '1px solid #666',
                          lineHeight: '1.15em'
                        }}>{formatName(group.name)}</Typography>
                      </Grid>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Input type="text" value={getPath} onChange={e => setGetPath(e.target.value)} />
          <Button onClick={() => {

            void api(GET_MANAGE_ROLES, true);

          }}>GET</Button>
          <pre>{JSON.stringify(test, null, '\t')}</pre>
          <pre>{JSON.stringify(users, null, '\t')}</pre>
        </Grid>
        <Grid item xs={6}>
          <Grid container direction="column">
            <Input type="text" value={postPath} onChange={e => setPostPath(e.target.value)} />
            <Input multiline type="text" value={body} onChange={e => setBody(e.target.value)} />
            <Input type="file" name="file" id="file" value={file} onChange={e => { setFile(e.target.value) }} />
            <Button onClick={() => {
              void api(TEST_API, true, { ...JSON.parse(body), file });
            }}>Post request</Button>
            <pre>{JSON.stringify(test, null, '\t')}</pre>
          </Grid>
        </Grid>
      </Grid>
    </Secure>
  </>
}

export default Home;



  // component('Secure', { ...props, contentRoleGroups: SiteRoles.ADMIN },
  //   <Grid container>
  //     <Grid item xs={12}>
  //       <Grid container direction="column" spacing={4} justifyContent="space-evenly" >
  //         <Grid item>
  //           <Typography variant="h6">Group</Typography>
  //         </Grid>
  //         <Grid item xs={6}>
  //           <FormControl>
  //             <Input type="text" value={getPath} onChange={e => setGetPath(e.target.value)} />

  //           </FormControl>
  //           <TextField
  //             fullWidth id="name" label="Name" value={group.name} name="name" onChange={handleName}
  //             multiline
  //             InputProps={{
  //               endAdornment: group.name && (
  //                 <InputAdornment
  //                   component={({ children }) =>
  //                     <Grid container alignItems="center" style={{ width: 'calc(100% + 5em)', maxWidth: 'calc(100% + 5em)' }}>
  //                       {children}
  //                     </Grid>
  //                   }
  //                   position="start"
  //                   style={{ display: 'flex' }}
  //                 >
  //                   <Grid item ><ArrowRightAlt /></Grid>
  //                   <Grid item xs style={{ wordBreak: 'break-all' }}>
  //                     <Typography style={{
  //                       backgroundColor: 'rgb(38 42 43)',
  //                       padding: '0 4px',
  //                       border: '1px solid #666',
  //                       lineHeight: '1.15em'
  //                     }}>{formatName(group.name)}</Typography>
  //                   </Grid>
  //                 </InputAdornment>
  //               ),
  //             }}
  //           />
  //         </Grid>
  //       </Grid>
  //     </Grid>
  //     <Grid item xs={6}>
  //       <Input type="text" value={getPath} onChange={e => setGetPath(e.target.value)} />
  //       <Button onClick={() => {

  //         void api(GET_MANAGE_USERS, true);

  //       }}>GET</Button>
  //       <pre>{JSON.stringify(test, null, '\t')}</pre>
  //       <pre>{JSON.stringify(users, null, '\t')}</pre>
  //     </Grid>
  //     <Grid item xs={6}>
  //       <Grid container direction="column">
  //         <Input type="text" value={postPath} onChange={e => setPostPath(e.target.value)} />
  //         <Input multiline type="text" value={body} onChange={e => setBody(e.target.value)} />
  //         <Input type="file" name="file" id="file" value={file} onChange={e => { setFile(e.target.value) }} />
  //         <Button onClick={() => {
  //           void api(TEST_API, true, { ...JSON.parse(body), file });
  //         }}>POST</Button>
  //         <pre>{JSON.stringify(test, null, '\t')}</pre>
  //       </Grid>
  //     </Grid>
  //   </Grid>
  // )
