'use strict';

const moment = require('moment');
const async = require('neo-async');
const {
  doAsyncAwaitWork,
  doAsyncCallbackWork,
  getAsyncArrayDataSet
} = require('../common/async-utils');
const {
  recordRunTime,
  connect,
  getAverageRunTimes,
  kill,
  CG,
  getRunDuration
} = require('../common/utils');
const loopNames = {
  lyingBasicForEachLoop: 'lyingBasicForEachLoop',
  forEachTellingTheTruth: 'forEachTellingTheTruth',
  asyncEach: 'asyncEach'
};
const unitOfTime = 'seconds';
const startTime = moment();
run();

function run() {
  const data = {
    runTimes: []
  };
  async.waterfall(
    [async.apply(connect, data), getAsyncArrayDataSet, runLoops],
    workComplete
  );
}

function runLoops(data, callback) {
  async.waterfall(
    [
      async.apply(asyncEach, data),
      CG,
      lyingBasicForEachLoop,
      CG,
      forEachTellingTheTruth
    ],
    callback
  );
}

async function lyingBasicForEachLoop(data, callback) {
  const { dataSet, db } = data;
  const now = moment();
  dataSet.forEach(async item => {
    await doAsyncAwaitWork(item, db).catch(callback);
  });
  recordRunTime(data, now, loopNames.lyingBasicForEachLoop, unitOfTime);
  return callback(null, data);
}

async function forEachTellingTheTruth(data, callback) {
  const { dataSet, db } = data;
  const now = moment();

  for (const item of dataSet) {
    await doAsyncAwaitWork(item, db).catch(callback);
  }

  recordRunTime(data, now, loopNames.forEachTellingTheTruth, unitOfTime);
  return callback(null, data);
}

function asyncEach(data, callback) {
  const now = moment();
  const { dataSet, db } = data;

  async.each(dataSet, async.apply(doAsyncCallbackWork, db), done);

  function done(err) {
    if (err) return callback(err);
    recordRunTime(data, now, loopNames.asyncEach, unitOfTime);
    return callback(null, data);
  }
}

function workComplete(err, data) {
  if (err) throw err;
  getAverageRunTimes(data, unitOfTime);
  console.log(
    `Total run time: ${getRunDuration(startTime, 'seconds')} seconds`
  );
  kill();
}
