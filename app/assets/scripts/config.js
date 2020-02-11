'use strict';
const defaultsDeep = require('lodash.defaultsdeep');
/*
 * App configuration.
 *
 * Uses settings in config/production.js, with any properties set by
 * config/staging.js or config/local.js overriding them depending upon the
 * environment.
 *
 * This file should not be modified.  Instead, modify one of:
 *
 *  - config/production.js
 *      Production settings (base).
 *  - config/staging.js
 *      Overrides to production if ENV is staging.
 *  - config/local.js
 *      Overrides if local.js exists.
 *      This last file is gitignored, so you can safely change it without
 *      polluting the repo.
 */

var configurations = {
  defaults: require('./config/defaults'),
  local: require('./config/local'),
  production: require('./config/production'),
  staging: require('./config/staging')
};

var config = configurations.defaults || {};

if (process.env.DS_ENV === 'staging') {
  config = defaultsDeep(configurations.staging, config);
} else if (process.env.DS_ENV === 'production') {
  config = defaultsDeep(configurations.production, config);
} else {
  config = defaultsDeep(configurations.local || {}, config);
}

module.exports = config;
