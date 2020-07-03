import { resolve } from 'path';
import { parsePageId, getTableData } from './utils';
import { fetchPageById } from './notion-adapter';

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
    handler: async (req, res) => {
      const pageId = parsePageId(options.indexPageId);
      const pageList = await fetchPageById(pageId);

      if (!pageList.recordMap.collection) {
        res.statusCode = 404;
        res.end();
        return;
      }

      const collection = Object.keys(pageList.recordMap.collection).map(
        k => pageList.recordMap.collection[k]
      )[0];

      const collectionView = Object.keys(
        pageList.recordMap.collection_view
      ).map(k => pageList.recordMap.collection_view[k])[0];

      const { rows } = await getTableData(
        collection,
        collectionView.value.id,
        req.notionToken
      );

      res.end(JSON.stringify(rows));
    },
  });
  this.addServerMiddleware(resolve(__dirname, 'page-detail.js'));
};

module.exports.meta = require('../package.json');
