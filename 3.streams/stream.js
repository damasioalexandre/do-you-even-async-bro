'use strict';

const moment = require('moment');
const async = require('neo-async');
const { doAsyncCallbackWork } = require('../common/async-utils');
const { getAsyncDataSetCursor } = require('../common/stream-utils');
const { connect, CG, recordRunTime, workComplete } = require('../common/utils');

const streamNames = {
  stream: 'stream',
  batchedStream: 'batchedStream'
};
run();

function run() {
  const data = {
    runTimes: [],
    startTime: moment(),
    unitOfTime: 'seconds',
    limit: 20000
  };
  async.waterfall(
    [
      async.apply(connect, data),
      getAsyncDataSetCursor,
      runStream,
      CG,
      getAsyncDataSetCursor,
      runBatchedStream
    ],
    workComplete
  );
}

function runStream(data, callback) {
  const { cursor, db, limit } = data;
  const now = moment();
  let count = 1;
  cursor
    .stream()
    .on('data', statusFlowLog => {
      doAsyncCallbackWork(db, statusFlowLog, err => {
        if (err) return callback(err);
        count++;
        if (count === limit) {
          recordRunTime(data, now, streamNames.stream);
          return callback(null, data);
        }
      });
    })
    .on('error', callback);
}

function runBatchedStream(data, callback) {
  const { cursor, db, limit } = data;
  const now = moment();
  let count = 1;
  const stream = cursor.batchSize(100).stream();
  stream
    .on('data', statusFlowLog => {
      doAsyncCallbackWork(db, statusFlowLog, err => {
        if (err) return callback(err);
        count++;
        if (count === limit) {
          recordRunTime(data, now, streamNames.batchedStream);
          return callback(null, data);
        }
      });
    })
    .on('error', callback);
}
