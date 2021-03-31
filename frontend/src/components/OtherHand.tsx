import React from 'react';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { WIDTH, HEIGHT } from './Table';

const useStyles = makeStyles({
  activePlayer: {
    fontWeight: 'bold',
    fontSize: '1.5em',
  }
});

const CARD_WIDTH = 50;
const CARD_HEIGHT = 70;

// get left and top attributes by radially laying out hand
function getPosition(pos: number, total: number) {
  const radians = 2 * Math.PI * pos / total
  const left = (Math.cos(radians) + 1) * WIDTH * .8 / 2 + WIDTH * .1 - CARD_WIDTH / 2;
  const top = (Math.sin(radians) + 1) * HEIGHT * .6 / 2 + HEIGHT * .1 - CARD_HEIGHT / 2;
  return { top, left };
}

function OtherHand({ hand, total, turn }) {
  const classes = useStyles();
  const pos = getPosition(hand.position, total);
  return (
    <Box position="absolute" {...pos}>
      <Card height={CARD_HEIGHT} back />
      <Typography
        className={hand.position === turn ? classes.activePlayer : ""}
        align="center">
        {hand.count}
      </Typography>
    </Box>
  );
}
export default OtherHand;
