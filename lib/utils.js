import { fetchTableData } from './notion-adapter';

const idToUuid = path =>
  `${path.substr(0, 8)}-${path.substr(8, 4)}-${path.substr(
    12,
    4
  )}-${path.substr(16, 4)}-${path.substr(20)}`;

export const parsePageId = id => {
  if (id) {
    const rawId = id.replace(/-/g, '').slice(-32);
    return idToUuid(rawId);
  }
};

export const getTableData = async (
  collection,
  collectionViewId,
  notionToken = null,
  raw = false
) => {
  const table = await fetchTableData(
    collection.value.id,
    collectionViewId,
    notionToken
  );

  const collectionRows = collection.value.schema;
  const collectionColKeys = Object.keys(collectionRows);

  const tableArr = table.result.blockIds.map(id => table.recordMap.block[id]);

  const tableData = tableArr.filter(
    b =>
      b.value && b.value.properties && b.value.parent_id === collection.value.id
  );

  const rows = [];

  for (const td of tableData) {
    const row = { id: td.value.id };

    for (const key of collectionColKeys) {
      const val = td.value.properties[key];
      if (val) {
        const schema = collectionRows[key];
        // row[schema.name] = val;

        row[schema.name] = raw ? val : getNotionValue(val, schema.type);

        // TODO get commented stuff back!
        // if (schema.type === "person" && row[schema.name]) {
        //   const users = await fetchNotionUsers(row[schema.name]);
        //   row[schema.name] = users;
        // }
      }
    }
    rows.push(row);
  }

  return { rows, schema: collectionRows };
};

const getTextContent = text => {
  return text.reduce((prev, current) => prev + current[0], '');
};

export const getNotionValue = (val, type) => {
  switch (type) {
    case 'text':
      return getTextContent(val);
    case 'person':
      return val.filter(v => v.length > 1).map(v => v[1][0][1]) || [];
    case 'checkbox':
      return val[0][0] === 'Yes';
    case 'date':
      if (val[0][1][0][0] === 'd') return val[0][1][0][1].start_date;
      else return '';
    case 'title':
      return getTextContent(val);
    case 'select':
      return val[0][0];
    case 'multi_select':
      return val[0][0].split(',');
    case 'number':
      return Number(val[0][0]);
    case 'relation':
      return val
        .filter(([symbol]) => symbol === '‣')
        .map(([_, relation]) => (relation ? relation[0][1] : ''));
    default:
      // eslint-disable-next-line no-console
      console.log({ val, type });
      return 'Not supported';
  }
};
