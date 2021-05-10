import React, { useContext } from "react";
import { Box, Button, Dialog, Typography } from "@material-ui/core";
import { SocketContext } from "../util/socket";
import { PlayerContext } from "../util/player";

function GameOver({ winner }) {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);

  const resetLobby = () => socket.emit('DeleteGame', {lobby_code: player.room});

  return (
    <Dialog open={winner !== undefined}>
      <Box p={3} display="flex" flexDirection="column" justifyContent="center">
        <Box mb={3}>
          <Typography variant="h3">
            {winner} has won the game!
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-evenly">
          <Button
            variant="contained"
            color="primary"
            href="/">
            Back to Home
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={resetLobby}>
            Reset Lobby
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
export default GameOver;
