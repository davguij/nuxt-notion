import { fetchPageById, fetchBlocks } from './notion-adapter';
import { getTableData } from './utils';

export default {
  path: '/_notion/page',
  handler: async (req, res, _next) => {
    const pageId = req.url.replace('/', '');
    const page = await fetchPageById(pageId, req.notionToken);

    const baseBlocks = page.recordMap.block;

    let allBlocks = {
      ...baseBlocks,
    };
    let allBlockKeys;

    while (true) {
      allBlockKeys = Object.keys(allBlocks);

      const pendingBlocks = allBlockKeys.flatMap(blockId => {
        const block = allBlocks[blockId];
        const content = block.value.content;

        return content && block.value.type !== 'page'
          ? content.filter(id => !allBlocks[id])
          : [];
      });

      if (!pendingBlocks.length) {
        break;
      }

      const newBlocks = await fetchBlocks(pendingBlocks).then(
        res => res.recordMap.block
      );

      allBlocks = { ...allBlocks, ...newBlocks };
    }

    const collection = page.recordMap.collection
      ? page.recordMap.collection[Object.keys(page.recordMap.collection)[0]]
      : null;

    const collectionView = page.recordMap.collection_view
      ? page.recordMap.collection_view[
          Object.keys(page.recordMap.collection_view)[0]
        ]
      : null;

    if (collection && collectionView) {
      const pendingCollections = allBlockKeys.flatMap(blockId => {
        const block = allBlocks[blockId];

        return block.value.type === 'collection_view' ? [block.value.id] : [];
      });

      for (const b of pendingCollections) {
        const { rows, schema } = await getTableData(
          collection,
          collectionView.value.id,
          req.notionToken,
          true
        );

        const viewIds = allBlocks[b].value.view_ids;

        allBlocks[b] = {
          ...allBlocks[b],
          collection: {
            title: collection.value.name,
            schema,
            types: viewIds.map(id => {
              const col = page.recordMap.collection_view[id];
              return col ? col.value : undefined;
            }),
            data: rows,
          },
        };
      }
    }

    res.end(JSON.stringify(allBlocks));
  },
};
