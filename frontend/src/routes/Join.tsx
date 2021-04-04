import React, { FormEvent, useContext, useState } from 'react';
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
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (nickname === '') return;
    player.nickname = nickname;
    player.room = room;
    props.history.push(`/lobby`);
  }
  return (
    <form onSubmit={onSubmit}>
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
          autoFocus
          onChange={event => setNickname(event.target.value)} />
        <Button type="submit" variant="contained" color="primary">
          Join Game
      </Button>
      </Box>
    </form>
  )
}
export default withRouter(Join);
