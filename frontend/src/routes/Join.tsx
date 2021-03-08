import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography, TextField } from '@material-ui/core';
import { RouterProps, useParams, withRouter } from 'react-router-dom';
import { PlayerContext } from '../util/player';

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

function Join(props: RouterProps) {
  const classes = useStyles();
  const [nickname, setNickname] = useState('');
  const { room } = useParams<{ room: string }>();
  const player = useContext(PlayerContext);
  const onSubmit = () => {
    if (nickname === '') return;
    player.nickname = nickname;
    player.room = room;
    props.history.push(`/lobby`);
  }
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Typography className={classes.title}>Enter your name</Typography>
      <TextField
        className={classes.textfield}
        label="Nickname"
        variant="outlined"
        onChange={event => setNickname(event.target.value)}
        onSubmit={onSubmit} />
      <Button variant="contained" color="primary" onClick={onSubmit}>
        Join Game
      </Button>
    </Box>
  )
}
export default withRouter(Join);
