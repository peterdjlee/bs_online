

import { makeStyles } from '@material-ui/core';
import { Box } from '@material-ui/core';

const useStyles = makeStyles({
  box: {
    marginTop: "50px"
  }
});

function Table() {
  const classes = useStyles();
  return (
    <Box
      className={classes.box}
      border={1}
      borderRadius="50%"
      borderColor="grey.400"
      flexDirection="row"
      display="flex"
      width="100vh"
      height="100vh">
    </Box>
  );
}

export default Table;
