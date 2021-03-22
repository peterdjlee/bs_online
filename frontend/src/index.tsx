import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';

import './index.css';
import Home from './routes/Home';
import Join from './routes/Join';
import Lobby from './routes/Lobby';
import Game from './routes/Game';
import { socket, SocketContext } from './util/socket';
import { defaultPlayer, PlayerContext } from './util/player';
import NotificationWrapper from './components/NotificationWrapper';

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Schoolbell',
  },
});

const router = (
  <SocketContext.Provider value={socket}>
    <PlayerContext.Provider value={defaultPlayer}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationWrapper>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Game} />
              <Route exact path="/join/:room" component={Join} />
              <Route exact path="/lobby" component={Lobby} />

              <Route exact path="/*" render={() => <Redirect to="/" />} />
            </Switch>
          </BrowserRouter>
        </NotificationWrapper>
      </ThemeProvider>
    </PlayerContext.Provider>
  </SocketContext.Provider>
)

ReactDOM.render(router, document.getElementById('root'));
