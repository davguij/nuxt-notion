const { resolve } = require('path');

module.exports = function(moduleOptions) {
  console.log('hello from module');
  const options = {
    ...this.options['nuxt-notion'],
    ...moduleOptions,
  };

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-notion.js',
    options,
  });

  this.addServerMiddleware(resolve(__dirname, 'page-list.js'));
  this.addServerMiddleware(resolve(__dirname, 'page-detail.js'));
};

module.exports.meta = require('../package.json');
