import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import OtherHand, { getPosition, CARD_HEIGHT, CARD_WIDTH } from './OtherHand';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';

export const WIDTH = 1000;
export const HEIGHT = 600;

const useStyles = makeStyles({
  playedCard: {
    position: 'absolute',
    animation: '$slide 1s',
    animationDelay: 'calc(var(--order)*300ms)'
  },
  '@keyframes slide': {
    "100%": {
      left: WIDTH / 2 - CARD_WIDTH / 2,
      top: HEIGHT / 2 - 1.5 * CARD_HEIGHT
    }
  }
});

function Table({ hands, turn, played }: {
  hands: object[],
  turn: number,
  played?: {
    pos: number,
    count: number
  }
}) {
  const classes = useStyles();
  let startPos;
  let playedCards: JSX.Element[] = [];
  if (played) {
    startPos = getPosition(played.pos, hands.length);
    for (let i = 0; i < played.count; i++) {
      playedCards.push(
        <Box
          key={i + hands.length * played.pos}
          className={classes.playedCard}
          style={{"--order": i}}
          {...startPos}>
          <Card height={CARD_HEIGHT} back />
        </Box>
      );
    }
  }

  return (
    <Box
      border={1}
      marginTop="50px"
      borderRadius="50%"
      borderColor="grey.400"
      position="relative"
      width={WIDTH}
      height={HEIGHT}>
      {played !== undefined && playedCards}
      {hands.map((hand, i) => (
        <OtherHand hand={hand} total={hands.length} turn={turn} key={i} />
      ))}
    </Box>
  );
}

export default Table;
