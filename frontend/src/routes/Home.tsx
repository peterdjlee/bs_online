import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  title: {
    fontSize: "40px",
    marginBottom: "100px",
  }
});

function Home() {
  const classes = useStyles();
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Typography className={classes.title}>BS Online</Typography>
      <Button variant="contained" color="primary" href="/join">
        Create a Game
      </Button>
    </Box>
  )
}
export default Home;
