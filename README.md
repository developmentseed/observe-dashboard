# project-seed

A basic starting point for web projects

## Overview

Steps to follow as soon as you download this structure to start a project:
- [ ] Update `package.js` with data about the project (name, repo, license...)
- [ ] If the license is known update `LICENSE`
- [ ] Update `.circleci/config.yml` with correct repo and other needed information.
- [ ] On `index.html` update the project title and check for other boostrap information that can be changed or removed.
- [ ] Remove unneeded images from the `graphics` folder and replace the favicon with a project related one.
- [ ] Update the modules to the most recent version.
- [ ] **Delete this `README.md` and rename `_README.md`. Fill in the needed data. This is the most important task.** Others need to be able to know what the project is about and how to work with it. This can't be stressed enough.

It's better to do this straight away so no traces of project-seed are ever pushed to github and just looks more professional.
The values that are not immediately know should be left blank and filled ASAP.

## Gulp for building
The gulpfile is based on the [gulp-webapp](https://github.com/yeoman/generator-gulp-webapp) yeoman generator. The build system currently supports:

- Image optimization
- Sass compilation
- Watchify for JS bundling
- Minification/uglification where appropriate
- Serving and live reloading of pages

There are two commands, both run via [`yarn`](https://yarnpkg.com/en/).

- `yarn build` - clean & build everything and put it into dist folder
- `yarn serve` - serve the pages and utilize live reload on changes to styles, fonts, images, scripts and HTML.


## Assets Structure

```
app/assets/
|
+- scripts/: The user scripts
|  |
|  +- config/: configuration files (see configuration section)
|
+- styles/: The sass styles
|
+- vendor/: Any third-party script that can't be required()
|
+- graphics/: Images for the site divided in:
|  |
|  +- layout/: Images for layout elements (Ex: background images)
|  +- meta/: Images for the meta tags (Mostly icons and facebook images)
|  +- content/: Content image
|
```

### Configurations and environment variables

At times, it may be necessary to include options/variables specific to `production`, `staging` or `local` in the code. To handle this, there is a master config.js file. This file should not be modified.  Instead, modify one of:

- config/production.js - production settings
- config/staging.js - overrides the production settings for staging server (basically Travis not on the DEPLOY branch)
- config/local.js - local (development) overrides. This file is gitignored, so you can safely change it without polluting the repo.

When developing locally with `yarn run serve`, the default will be to use `production.js` (with overrides from `local.js`).  However, if you need to run with the staging settings, use: `yarn run stage` (this will not start a server)


### How scripts are built

The script build, which uses `browserify`, outputs two js files: `bundle.js` and
`vendor.js`:
 - `bundle.js`, created by the `javascript` task in deployment and by
   `watchify` during development, contains all the app-specific code:
   `app/scripts/main.js` and all the scripts it `require`s that are local to
   this app.
 - `vendor.js`, created by the `vendorBundle` task, contains all the external
   dependencies of the app: namely, all the packages you install using `yarn
   add ...`.

## Circle CI for testing and deployment
The `.circleci/config.yml` file enables the usage of [Circle CI](http://circleci.com/) as a test and deployment system. In this particular case, Travis will be looking for any changes to the repo and when a change is made to the `master` branch, Travis will build the project and deploy it to the `gh-pages` branch.

## Linting

Our [ESLint rules](.eslintrc) are based on `standard` rules, with semicolons enabled. To check  linting errors run:

    yarn lint

## Coding style

File [.editorconfig](.editorconfig) defines basic code styling rules, like indent sizes. 

[Prettier](https://prettier.io) is the recommended code formatter. Atom and VSCode have extensions supporting Prettier-ESLint integration, which will help maintain style consistency while following linting rules.