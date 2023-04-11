import { expect } from 'vitest';

expect.addSnapshotSerializer({
  serialize: (val) => JSON.stringify({ ...val, S3Key: '[HASH REMOVED].zip' }),
  test: (val) => val && Object.prototype.hasOwnProperty.call(val, 'S3Key'),
});

expect.addSnapshotSerializer({
  serialize: (val) =>
    JSON.stringify({
      ...val,
      SourceObjectKeys: val.SourceObjectKeys.map(() => '[HASH REMOVED].zip'),
    }),
  test: (val) =>
    val && Object.prototype.hasOwnProperty.call(val, 'SourceObjectKeys'),
});
