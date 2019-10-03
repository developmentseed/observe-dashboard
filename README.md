# Observe Dashboard

A dashboard to browse and manage data from the [Observe](https://github.com/developmentseed/observe) mobile mapping application.

## Installation and Usage

The steps below will walk you through setting up a development environment for the frontend.

### Install dependencies

Install the following on your system:

- [Git](https://git-scm.com)
- [nvm](https://github.com/creationix/nvm)
- [yarn](https://yarnpkg.com/docs/install)

Clone this repository locally and activate required Node.js version:

```
nvm install
```

Install Node.js dependencies:

```
yarn install
```

#### Config files

The config files can be found in `app/assets/scripts/config`. After installing the project, there will be an empty `local.js` that you can use to set the config. This file should not be committed.

Please refer to [defaults.js](app/assets/scripts/config/defaults.js) for the available configuration properties.

### Development

Start server with live code reload at [http://localhost:9000](http://localhost:9000):

    yarn serve

### Build to production

Generate a minified build to `dist` folder:

    yarn build

## References & Related Repositories

- [API](https://github.com/developmentseed/observe-api)
- [Mobile app](https://github.com/developmentseed/observe)

## License

[MIT](LICENSE)
