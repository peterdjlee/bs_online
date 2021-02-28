import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';

import './index.css';
import App from './App';

const router = (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />

      <Route exact path="/*" render={() => <Redirect to="/" />} />
    </Switch>
  </BrowserRouter>
)

ReactDOM.render(router, document.getElementById('root'));
