'use strict';
import '@babel/polyfill';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';

import theme from './styles/theme/theme';

import { store } from './utils/store';
import history from './utils/history';

import GlobalStyles from './styles/global';

// Views
import Home from './components/home';
import Sandbox from './components/sandbox';
import About from './components/about';
import Traces from './components/traces';
import Photos from './components/photos';
import UhOh from './components/uhoh';
import ErrorBoundary from './fatal-error-boundary';

// Root component. Used by the router.
const Root = () => (
  <Provider store={store}>
    <Router history={history}>
      <ThemeProvider theme={theme.main}>
        <ErrorBoundary>
          <GlobalStyles />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/traces' component={Traces} />
            <Route exact path='/photos' component={Photos} />
            <Route exact path='/sandbox' component={Sandbox} />
            <Route exact path='/about' component={About} />
            <Route path='*' component={UhOh} />
          </Switch>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  </Provider>
);

render(<Root store={store} />, document.querySelector('#app-container'));
