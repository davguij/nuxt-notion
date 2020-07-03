import { parsePageId, getTableData } from '../utils';
import { fetchPageById } from '../notion-adapter';

export default ({ indexPageId }) => async (req, res) => {
  const pageId = parsePageId(indexPageId);
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
};
