import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#00695f' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6f8' }
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  }
});

export default theme;
