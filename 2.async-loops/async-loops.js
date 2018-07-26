'use strict';

const moment = require('moment');
const async = require('neo-async');
const {
  doAsyncAwaitWork,
  doAsyncCallbackWork,
  getAsyncArrayDataSet
} = require('../common/async-utils');
const { recordRunTime, connect, CG, workComplete } = require('../common/utils');
const loopNames = {
  lyingBasicForEachLoop: 'lyingBasicForEachLoop',
  forEachTellingTheTruth: 'forEachTellingTheTruth',
  asyncEach: 'asyncEach',
  hybridAsyncEach: 'hybridAsyncEach'
};
const { setCurrentTask } = require('../common/memory-utils');

run();

function run() {
  const data = {
    runTimes: [],
    startTime: moment(),
    unitOfTime: 'seconds'
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
      forEachTellingTheTruth,
      CG,
      hybridAsyncEach,
      CG
    ],
    callback
  );
}

async function lyingBasicForEachLoop(data, callback) {
  setCurrentTask(loopNames.lyingBasicForEachLoop);
  const { dataSet, db } = data;
  const now = moment();
  dataSet.forEach(async item => {
    await doAsyncAwaitWork(item, db).catch(callback);
  });
  recordRunTime(data, now, loopNames.lyingBasicForEachLoop);
  return callback(null, data);
}

async function forEachTellingTheTruth(data, callback) {
  setCurrentTask(loopNames.forEachTellingTheTruth);
  const { dataSet, db } = data;
  const now = moment();

  for (const item of dataSet) {
    await doAsyncAwaitWork(item, db).catch(callback);
  }

  recordRunTime(data, now, loopNames.forEachTellingTheTruth);
  return callback(null, data);
}

function asyncEach(data, callback) {
  setCurrentTask(loopNames.asyncEach);
  const now = moment();
  const { dataSet, db } = data;

  async.each(dataSet, async.apply(doAsyncCallbackWork, db), done);

  function done(err) {
    if (err) return callback(err);
    recordRunTime(data, now, loopNames.asyncEach);
    return callback(null, data);
  }
}

function hybridAsyncEach(data, callback) {
  setCurrentTask(loopNames.hybridAsyncEach);
  const now = moment();
  const { dataSet, db } = data;

  async.each(
    dataSet,
    async (item, next) => {
      await doAsyncAwaitWork(item, db);
      next();
    },
    done
  );
  function done(err) {
    if (err) return callback(err);
    recordRunTime(data, now, loopNames.hybridAsyncEach);
    return callback(null, data);
  }
}
