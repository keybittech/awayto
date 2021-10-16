import { createMuiTheme, createStyles, StyleRules, Theme } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';

const drawerWidth = 150;

/**
 * @category Style
 */
export const styles = ({ mixins, spacing }: Theme): StyleRules => createStyles({

  appLogo: { width: '64px' },
  logo: { width: '64px' },

  root: { display: 'flex' },

  backdrop: { zIndex: 99999, color: '#fff', },

  siteTitle: { fontSize: '1.5rem', fontFamily: 'roboto', textAlign: 'center' },

  menuText: { fontSize: '.75rem' },

  appBar: { width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth, backgroundColor: '#666' },
  drawer: { width: drawerWidth },
  drawerPaper: {
    width: drawerWidth,
    // backgroundColor: '#121f31',
  },
  // necessary for content to be below app bar
  toolbar: mixins.toolbar,
  content: { flexGrow: 1, padding: spacing(3) },

  menuIcon: { "&:hover svg": { color: '#aaa' }, width: '100%' },

  loginWrap: { marginTop: '50px' },

  dropzone: { width: '400px', height: '150px' },

  //Common
  infoHeader: { fontWeight: 500, fontSize: '1rem', textTransform: 'uppercase', color: '#aaa !important' },
  infoLabel: { fontWeight: 500, fontSize: '1rem' },
  infoCard: { height: '200px', overflowY: 'auto' },


  green: { color: green[500] },
  red: { color: red[500] },

  audioButton: { cursor: 'pointer' },

  overflowEllipsis: { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' },

  blueChecked: { '& .MuiSvgIcon-root': { color: 'lightblue' } }
});

const theme = {
  palette: {
    primary: {
      main: '#fff',
      light: '#fff',
      dark: '#121f31',
      contrastText: '#000',
    },
    secondary: { main: '#aaa' }
  },

  typography: {
    fontSize: 16,
    body1: {
      fontSize: 16,
    },
  },

  overrides: {
    MuiTableCell: {
      root: {
        padding: '4px 8px !important'
      }
    },
    MuiTableBody: {
      root: {
        '& .MuiTableCell-body:not(:last-child)': {
          '&:not(:last-child)': {
            borderRight: '1px solid rgb(228, 228, 228)',
          }
        },
        '& .MuiIconButton-root': {
          padding: 0
        },
        '& .MuiButton-textSizeSmall': {
          padding: '0 4px'
        }
      }
    },
    MuiSlider: {
      root: {
        padding: '4px 0'
      }
    },
    MuiList: {
      root: {
        listStyleType: 'disc',
        marginTop: 24,
        marginBottom: 24,
      },
      padding: {
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 16,
      }
    },
    MuiListItem: {
      root: {
        display: 'list-Item',
      },
      gutters: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    MuiTypography: {
      root: {
        marginTop: 24,
        marginBottom: 24,
      },
    },
  }
};

/**
 * @category Style
 */
export const lightTheme = createMuiTheme({
  ...theme,
  palette: {
    ...theme.palette,
    type: 'light',
    primary: { main: '#000' }
  },
});

/**
 * @category Style
 */
export const darkTheme = createMuiTheme({
  ...theme,
  palette: {
    ...theme.palette,
    type: 'dark',
    primary: { main: '#fff' }
  },
  ...styles
});


/**
 * @category Style
 */
export type IStyles = Record<keyof ReturnType<typeof styles>, string>
