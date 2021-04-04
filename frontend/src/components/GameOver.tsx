import React from "react";
import { Box, Button, Dialog, Typography } from "@material-ui/core";

function GameOver({ winner }) {
  return (
    <Dialog open={winner !== undefined}>
      <Box p={3} display="flex" flexDirection="column" justifyContent="center">
        <Box mb={3}>
          <Typography variant="h3">
            {winner} has won the game!
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          href="/">
          Back to Home
        </Button>
      </Box>
    </Dialog>
  );
}
export default GameOver;
