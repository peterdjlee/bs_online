import React, { useState } from 'react';
import { Snackbar } from '@material-ui/core';

import { NotificationContext } from '../util/notification';

function NotificationWrapper({ children }) {
  const [notification, setNotification] = useState('');
  return (
    <NotificationContext.Provider value={setNotification}>
      {children}
      <Snackbar
        anchorOrigin={{vertical: "top", horizontal: "center"}}
        open={notification !== ""}
        autoHideDuration={3000}
        onClose={() => setNotification("")}
        message={notification} />
    </NotificationContext.Provider>
  );
}
export default NotificationWrapper;
