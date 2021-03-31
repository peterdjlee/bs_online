import React from 'react';
import { Box } from '@material-ui/core';
import OtherHand from './OtherHand';

export const WIDTH = 1000;
export const HEIGHT = 600;

function Table({ hands, turn }: { hands: object[], turn: number }) {
  return (
    <Box
      border={1}
      marginTop="50px"
      borderRadius="50%"
      borderColor="grey.400"
      position="relative"
      width={WIDTH}
      height={HEIGHT}>
      {hands.map((hand, i) => (
        <OtherHand hand={hand} total={hands.length+1} turn={turn} key={i} />
      ))}
    </Box>
  );
}

export default Table;
