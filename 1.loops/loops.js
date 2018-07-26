'use strict';

const moment = require('moment');
const async = require('neo-async');
const {
  recordRunTime,
  connect,
  getDataSet,
  CG,
  doWork,
  workComplete
} = require('../common/utils');
const _ = require('lodash');
const R = require('ramda');
const loopNames = {
  basicForLoop: 'basicForLoop',
  reverseForLoop: 'reverseForLoop',
  cachedLengthForLoop: 'cachedLengthForLoop',
  asyncEach: 'asyncEach',
  lodash: 'lodash',
  ramdaForEach: 'ramdaForEach'
};
run();

function run() {
  const data = {
    runTimes: [],
    startTime: moment(),
    unitOfTime: 'ms'
  };
  async.waterfall(
    [async.apply(connect, data), getDataSet, runLoops],
    workComplete
  );
}

function runLoops(data, callback) {
  async.waterfall(
    [
      async.apply(basicForLoop, data),
      CG,
      reverseForLoop,
      CG,
      cachedLengthForLoop,
      CG,
      ramdaForEach,
      CG,
      lodashEach,
      CG,
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

function lodashEach(data, callback) {
  const now = moment();
  const { dataSet } = data;

  _.each(dataSet, doWork);
  recordRunTime(data, now, loopNames.lodash);

  return callback(null, data);
}

function ramdaForEach(data, callback) {
  const now = moment();
  const { dataSet } = data;

  R.forEach(doWork, dataSet);
  recordRunTime(data, now, loopNames.ramdaForEach);

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
