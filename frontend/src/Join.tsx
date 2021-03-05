import React from 'react';
import { createMuiTheme, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import { Box, Button, Typography, TextField } from '@material-ui/core';

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Schoolbell',
  },
});


const useStyles = makeStyles({
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  textfield: {
    fontSize: "20px",
    marginBottom: "100px",
  }
});

function Join() {
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
        <Typography className={classes.title}>Enter your name</Typography>
        <form className={classes.textfield} noValidate autoComplete="off">
          <TextField id="outlined-basic" label="Nickname" variant="outlined" />
        </form>
        <Button variant="contained" color="primary" href="/lobby">
          Join Game
        </Button>
      </Box>
    </ThemeProvider>
  )
}
export default Join;
