import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';

import './index.css';
import Home from './Home';
import Join from './Join';
import Lobby from './Lobby';
import { socket, SocketContext } from './util/socket';

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Schoolbell',
  },
});

const router = (
  <SocketContext.Provider value={socket}>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/join" component={Join} />
          <Route exact path="/lobby" component={Lobby} />

          <Route exact path="/*" render={() => <Redirect to="/" />} />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  </SocketContext.Provider>
)

ReactDOM.render(router, document.getElementById('root'));
