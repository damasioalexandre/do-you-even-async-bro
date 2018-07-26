'use strict';

const moment = require('moment');

function getAsyncArrayDataSet(data, callback) {
  const { db } = data;
  db.collection('statusFlowLogs')
    .find({})
    .project({
      customerName: 1,
      createdDate: 1,
      propensityToBuy: 1
    })
    .limit(10000)
    .toArray((err, results) => {
      data.dataSet = results;
      return callback(err, data);
    });
}

function work(statusFlowLog) {
  statusFlowLog.createdDate = moment()
    .add(2, 'hours')
    .subtract(2, 'hours');
  statusFlowLog.customerName = 'Alex';

  if (statusFlowLog.customerName === 'Alex') {
    statusFlowLog.customerName = 'Pew';
  }

  statusFlowLog.math = Math.floor(Math.random() + 0.22) % 9;

  return {
    customerName: statusFlowLog.customerName,
    createdDate: statusFlowLog.createdDate,
    math: statusFlowLog.math
  };
}

function doAsyncCallbackWork(db, statusFlowLog, callback) {
  const update = work(statusFlowLog);
  db.collection('statusFlowLogs').findOneAndUpdate(
    { _id: statusFlowLog._id },
    update,
    callback
  );
}

async function doAsyncAwaitWork(statusFlowLog, db) {
  const update = work(statusFlowLog);
  return db
    .collection('statusFlowLogs')
    .findOneAndUpdate({ _id: statusFlowLog._id }, update);
}

module.exports = {
  getAsyncArrayDataSet,
  doAsyncCallbackWork,
  doAsyncAwaitWork
};
