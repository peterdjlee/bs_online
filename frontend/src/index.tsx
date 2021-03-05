import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';

import './index.css';
import App from './App';
import Join from './Join';
import Lobby from './Lobby';

const router = (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/join" component={Join} />
      <Route exact path="/lobby" component={Lobby} />

      <Route exact path="/*" render={() => <Redirect to="/" />} />
    </Switch>
  </BrowserRouter>
)

ReactDOM.render(router, document.getElementById('root'));
