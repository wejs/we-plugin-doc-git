# We.js messenger plugin

[![Dependency Status](https://david-dm.org/wejs/we-plugin-doc-git.png)](https://david-dm.org/wejs/we-plugin-doc-git)
[![Build Status](https://travis-ci.org/wejs/we-plugin-doc-git.svg?branch=0.3.x)](https://travis-ci.org/wejs/we-plugin-doc-git)

## Has suport to:

 - Load and show docs fom git projects

### How to test

after clone and install npm packages:

```sh
npm test
```

##### For run only 'Chat' test use:

```sh
NODE_ENV=test LOG_LV=info ./node_modules/.bin/mocha test/bootstrap.js test/**/*.test.js -g 'Chat'
```

##### For run the javascript linter

```sh
npm run lint
```

#### NPM Info:
[![NPM](https://nodei.co/npm/we-plugin-doc-git.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/we-plugin-doc-git/)

## Copyright and license

Copyright 2013-2014 Alberto Souza <alberto.souza.dev@gmail.com> and contributors , under [the MIT license](LICENSE).
