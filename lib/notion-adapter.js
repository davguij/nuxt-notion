import fetch from 'node-fetch';

const NOTION_API = 'https://www.notion.so/api/v3';

const loadPageChunkBody = {
  limit: 999,
  cursor: { stack: [] },
  chunkNumber: 0,
  verticalColumns: false,
};

const queryCollectionBody = {
  query: { aggregations: [{ property: 'title', aggregator: 'count' }] },
  loader: {
    type: 'table',
    limit: 999,
    searchQuery: '',
    userTimeZone: 'Europe/Vienna',
    userLocale: 'en',
    loadContentCover: true,
  },
};

const fetchNotionData = async ({ resource, body, notionToken }) => {
  const res = await fetch(`${NOTION_API}/${resource}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(notionToken && { cookie: `token_v2=${notionToken}` }),
    },
    body: JSON.stringify(body),
  });

  return res.json();
};

export const fetchPageById = (pageId, notionToken = null) => {
  return fetchNotionData({
    resource: 'loadPageChunk',
    body: {
      pageId,
      ...loadPageChunkBody,
    },
    notionToken,
  });
};

export const fetchTableData = async (
  collectionId,
  collectionViewId,
  notionToken = null
) => {
  const table = await fetchNotionData({
    resource: 'queryCollection',
    body: {
      collectionId,
      collectionViewId,
      ...queryCollectionBody,
    },
    notionToken,
  });
  return table;
};

export const fetchBlocks = async (blockList, notionToken = null) => {
  return await fetchNotionData({
    resource: 'syncRecordValues',
    body: {
      recordVersionMap: {
        block: blockList.reduce((obj, blockId) => {
          obj[blockId] = -1;
          return obj;
        }, {}),
      },
    },
    notionToken,
  });
};
