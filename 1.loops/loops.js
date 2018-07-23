'use strict';

const moment = require('moment');
const async = require('async');
const {
  recordRunTime,
  connect,
  getDataSet,
  kill,
  getAverageRunTime
} = require('../common/utils');
const start = moment();
const loopNames = {
  basicForLoop: 'basicForLoop',
  reverseForLoop: 'reverseForLoop',
  cachedLengthForLoop: 'cachedLengthForLoop',
  asyncEach: 'asyncEach'
};
const runs = 36;
run();

function run() {
  const data = {
    runTimes: []
  };
  async.waterfall([async.apply(connect, data), getDataSet], err => {
    if (err) throw err;
    runLoops(data, workComplete);
  });
}

function workComplete(err, data) {
  if (err) throw err;

  async.parallel(
    {
      basicForLoop: async.apply(
        getAverageRunTime,
        data,
        loopNames.basicForLoop
      ),
      reverseForLoop: async.apply(
        getAverageRunTime,
        data,
        loopNames.reverseForLoop
      ),
      cachedLengthForLoop: async.apply(
        getAverageRunTime,
        data,
        loopNames.cachedLengthForLoop
      ),
      asyncEach: async.apply(getAverageRunTime, data, loopNames.asyncEach)
    },
    (err, results) => {
      console.log(results);
      kill();
    }
  );
}

function runLoops(data, callback) {
  async.waterfall(
    [
      async.apply(basicForLoop, data),
      reverseForLoop,
      cachedLengthForLoop,
      asyncEach
    ],
    callback
  );
}

function basicForLoop(data, callback) {
  const now = moment();
  const { dataSet } = data;

  for (let i = 0; i <= dataSet.length - 1; i++) {
    doWork(dataSet[i]);
  }

  recordRunTime(data, now, loopNames.basicForLoop);

  return callback(null, data);
}

function reverseForLoop(data, callback) {
  const now = moment();
  const { dataSet } = data;

  for (let i = dataSet.length - 1; i >= 0; i--) {
    doWork(dataSet[i]);
  }

  recordRunTime(data, now, loopNames.reverseForLoop);

  return callback(null, data);
}

function cachedLengthForLoop(data, callback) {
  const now = moment();
  const { dataSet } = data;
  const length = dataSet.length - 1;

  for (let i = 0; i <= length; i++) {
    doWork(dataSet[i]);
  }

  recordRunTime(data, now, loopNames.cachedLengthForLoop);

  return callback(null, data);
}

function asyncEach(data, callback) {
  const now = moment();
  const { dataSet } = data;

  async.each(dataSet, processRecord, err => {
    if (err) return callback(err);
    recordRunTime(data, now, loopNames.asyncEach);
    return callback(null, data);
  });

  function processRecord(record, next) {
    doWork(record);
    next();
  }
}

function doWork(statusFlowLog) {
  statusFlowLog.customerName = 'Alex';
  statusFlowLog.createdDate = moment()
    .add(2, 'hours')
    .add(2, 'hours')
    .add(2, 'hours')
    .subtract(2, 'hours')
    .subtract(2, 'hours')
    .subtract(2, 'hours');
  if (statusFlowLog.customerName === 'Alex') {
    statusFlowLog.customerName = 'Pew';
  }

  statusFlowLog.math = Math.floor(Math.random() + 0.22) % 9;
}
