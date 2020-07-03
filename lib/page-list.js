import { parsePageId, getTableData } from './utils';
import { fetchPageById } from './notion-adapter';

// TODO move this to a setting from the module nuxt config section
const pageListId = '9cad9a36cdf3433d8da2672df986fcbe';

export default {
  path: '/_notion/pages',
  handler: async (req, res, _next) => {
    const pageId = parsePageId(pageListId);
    const pageList = await fetchPageById(pageId);

    if (!pageList.recordMap.collection) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const collection = Object.keys(pageList.recordMap.collection).map(
      k => pageList.recordMap.collection[k]
    )[0];

    const collectionView = Object.keys(pageList.recordMap.collection_view).map(
      k => pageList.recordMap.collection_view[k]
    )[0];

    const { rows } = await getTableData(
      collection,
      collectionView.value.id,
      req.notionToken
    );

    res.end(JSON.stringify(rows));
  },
};
