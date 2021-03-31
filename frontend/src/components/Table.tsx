import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Box } from '@material-ui/core';
import OtherHand from './OtherHand';

export const WIDTH = 1000;
export const HEIGHT = 600;

const useStyles = makeStyles({
  box: {
    marginTop: "50px"
  }
});

function Table({ hands }: { hands: object[] }) {
  const classes = useStyles();
  return (
    <Box
      className={classes.box}
      border={1}
      borderRadius="50%"
      borderColor="grey.400"
      position="relative"
      width={WIDTH}
      height={HEIGHT}>
      {hands.map((hand, i) => <OtherHand hand={hand} total={hands.length} key={i} />)}
    </Box>
  );
}

export default Table;
