'use strict';
import '@babel/polyfill';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';

import theme from './styles/theme/theme';

import store from './store';
import history from './utils/history';

import GlobalStyles from './styles/global';

// Views
import Home from './components/home';
import Sandbox from './components/sandbox';
import About from './components/about';
import Auth from './components/auth';
import TracesIndex from './components/traces';
import TracesView from './components/traces/view';
import PhotosIndex from './components/photos';
import PhotosView from './components/photos/view';
import UhOh from './components/uhoh';
import ErrorBoundary from './fatal-error-boundary';
import ConfirmationPrompt from './components/common/confirmation-prompt';

// Root component. Used by the router.
const Root = () => (
  <Provider store={store}>
    <Router history={history}>
      <ThemeProvider theme={theme.main}>
        <ErrorBoundary>
          <GlobalStyles />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/login/redirect' component={Auth} />
            <Route exact path='/login' component={Auth} />
            <Route exact path='/logout' component={Auth} />
            <Route exact path='/traces/:traceId' component={TracesView} />
            <Route exact path='/traces' component={TracesIndex} />
            <Route exact path='/photos/:photoId' component={PhotosView} />
            <Route exact path='/photos' component={PhotosIndex} />
            <Route exact path='/sandbox' component={Sandbox} />
            <Route exact path='/about' component={About} />
            <Route path='*' component={UhOh} />
          </Switch>
          <ConfirmationPrompt />
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  </Provider>
);

render(<Root store={store} />, document.querySelector('#app-container'));
