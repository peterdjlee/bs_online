import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';

import './index.css';
import App from './App';
import Join from './Join';
import Lobby from './Lobby';
import { socket, SocketContext } from './util/socket';

const router = (
  <SocketContext.Provider value={socket}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/join" component={Join} />
        <Route exact path="/lobby" component={Lobby} />

        <Route exact path="/*" render={() => <Redirect to="/" />} />
      </Switch>
    </BrowserRouter>
  </SocketContext.Provider>
)

ReactDOM.render(router, document.getElementById('root'));
