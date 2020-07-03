import { resolve } from 'path';

import pageListHandler from './middleware/page-list';
import pageDetailHandler from './middleware/page-detail';

// const pageList = require(resolve(__dirname, 'page-list.js'));

module.exports = function(moduleOptions) {
  const options = {
    ...this.options['nuxt-notion'],
    ...moduleOptions,
  };

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-notion.js',
    options,
  });

  this.addServerMiddleware({
    path: '/_notion/pages',
    handler: pageListHandler(options),
  });

  this.addServerMiddleware({
    path: '/_notion/page',
    handler: pageDetailHandler(),
  });
};

module.exports.meta = require('../package.json');
