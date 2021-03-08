import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography, TextField } from '@material-ui/core';

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
  )
}
export default Join;
