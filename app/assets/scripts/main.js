'use strict';
import '@babel/polyfill';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import theme from './styles/theme/theme';

import { appPathname } from './config';
import store from './store';
import history from './utils/history';

import GlobalStyles from './styles/global';

// Views
import Home from './components/home';
import Auth from './components/auth';
import UsersIndex from './components/users';
import TracesIndex from './components/traces';
import TracesView from './components/traces/view';
import PhotosIndex from './components/photos';
import PhotosView from './components/photos/view';
import UhOh from './components/uhoh';
import ErrorBoundary from './fatal-error-boundary';
import ConfirmationPrompt from './components/common/confirmation-prompt';
import { ToastContainerCustom } from './components/common/toasts';

// Root component. Used by the router.
const Root = () => (
  <Provider store={store}>
    <Router basename={appPathname} history={history}>
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
            <Route exact path='/users' component={UsersIndex} />
            <Route path='*' component={UhOh} />
          </Switch>
          <ConfirmationPrompt />
          <ToastContainerCustom />
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  </Provider>
);

render(<Root store={store} />, document.querySelector('#app-container'));
