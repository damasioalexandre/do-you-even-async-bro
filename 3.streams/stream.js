'use strict';

const moment = require('moment');
const async = require('neo-async');
const { doAsyncCallbackWork } = require('../common/async-utils');
const { getAsyncDataSetCursor } = require('../common/stream-utils');
const { connect, getRunDuration } = require('../common/utils');
const unitOfTime = 'seconds';
run();

function run() {
  const data = {
    runTimes: [],
    startTime: moment()
  };
  async.waterfall(
    [async.apply(connect, data), getAsyncDataSetCursor, runStream],
    workComplete
  );
}

function runStream(data, callback) {
  const stream = data.cursor.stream();
  stream.on('data', statusFlowLog => {
    doAsyncCallbackWork(data.db, statusFlowLog, err => {
      if (err) return callback(err);
    });
  });
  stream.on('end', () => callback(null, data));
  stream.on('error', callback);
}

function workComplete(err, data) {
  if (err) throw err;

  console.log(
    'stream completed in',
    getRunDuration(data.startTime, unitOfTime)
  );
}
