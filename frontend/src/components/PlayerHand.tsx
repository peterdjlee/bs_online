import React from 'react';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import { Box, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  hand: {
    display: 'flex',
    'overflow-x': 'scroll',
  }
});

function PlayerHand({ cards }: { cards: string[] }) {
  const classes = useStyles();
  return (
    <Box className={classes.hand}>
      {cards.map((card, i) => (
        <div key={i} onClick={() => console.log('clicked:', card)}>
          <Card card={card} height="150px" />
        </div>
      ))}
    </Box>
  );
}

export default PlayerHand;
