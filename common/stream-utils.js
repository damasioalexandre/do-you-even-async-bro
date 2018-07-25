'use strict';

function getAsyncDataSetCursor(data, callback) {
  const { db, limit } = data;
  data.cursor = db
    .collection('statusFlowLogs')
    .find({})
    .project({
      customerName: 1,
      createdDate: 1,
      propensityToBuy: 1
    })
    .limit(limit);

  return callback(null, data);
}

module.exports = {
  getAsyncDataSetCursor
};
