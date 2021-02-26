import React from 'react';
import { createMuiTheme, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Schoolbell',
  },
});


const useStyles = makeStyles({
  title: {
    fontSize: "40px",
    marginBottom: "100px",
  }
});

function App() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <Typography className={classes.title}>BS Online</Typography>
        <Button variant="contained" color="primary">
          Create a Game
        </Button>
      </Box>
    </ThemeProvider>
  )
}
export default App;
