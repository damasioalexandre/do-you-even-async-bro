'use strict';

function getAsyncDataSetCursor(data, callback) {
  const { db } = data;
  data.cursor = db
    .collection('statusFlowLogs')
    .find({})
    .project({
      customerName: 1,
      createdDate: 1,
      propensityToBuy: 1
    })
    .limit(20000);

  return callback(null, data);
}

module.exports = {
  getAsyncDataSetCursor
};