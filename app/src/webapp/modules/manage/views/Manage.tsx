import React from 'react';
import { Button, Card, CardActions, CardContent, Grid, Typography } from '@material-ui/core';
import { SiteRoles, useComponents } from 'awayto';

export function Manage(props: IProps): JSX.Element {
  const { ManageUsers, ManageGroups, ManageRoles, ManageRoleActions, Secure } = useComponents();

  const menu = ['users', 'groups', 'roles', 'matrix'].map(comp =>
    <Button key={`menu_${comp}`} style={comp == props.match?.params.component ? { textDecoration: 'underline' } : undefined} onClick={() => props.history.push(`/manage/${comp}`)}>
      {comp}
    </Button>
  );

  const viewPage = () => {
    switch (props.match?.params.component) {
      case 'users':
        return <ManageUsers {...props} />
      case 'groups':
        return <ManageGroups {...props} />
      case 'roles':
        return <ManageRoles {...props} />
      case 'matrix':
        return <ManageRoleActions {...props} />
      default:
        return;
    }
  }

  return <>
    <h1>Manage</h1>
    <Grid container direction="row" spacing={1}>
      <Grid item xs={12}>
        <Secure {...props} contentSiteRole={SiteRoles.ADMIN} inclusive>
          <Card>
            <CardContent>
              <CardActions>
                <Grid container justifyContent="flex-start" alignItems="center">
                  <Typography variant="button">Identity:</Typography> {menu}
                </Grid>
              </CardActions>
              {viewPage()}
            </CardContent>
          </Card>
        </Secure>
      </Grid>
    </Grid>
  </>
}

export default Manage;