'use strict';
const moment = require('moment');
const MongoClient = require('mongodb');
const connectionString = 'mongodb://localhost:27017/money-machine';
const _ = require('lodash');
const { logMemoryStats } = require('./memory-utils');

function connect(data, callback) {
  MongoClient.connect(
    connectionString,
    (err, db) => {
      if (err) {
        return callback(err);
      }
      data.db = db;
      return callback(null, data);
    }
  );
}

function getDataSet(data, callback) {
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

function doWork(statusFlowLog) {
  statusFlowLog.createdDate = moment()
    .add(2, 'hours')
    .subtract(2, 'hours');
  statusFlowLog.customerName = 'Alex';

  if (statusFlowLog.customerName === 'Alex') {
    statusFlowLog.customerName = 'Pew';
  }

  statusFlowLog.math = Math.floor(Math.random() + 0.22) % 9;
}

function recordRunTime(data, time, alias) {
  data.runTimes.push({
    alias,
    executionTime: getRunDuration(time, data.unitOfTime)
  });
}

function getRunDuration(startTime, unitOfTime = 'ms') {
  return moment().diff(startTime, unitOfTime);
}

function CG(data, callback) {
  if (!global.gc) {
    return callback(null, data);
  }
  global.gc();
  setTimeout(() => callback(null, data), 500);
}

function logAverageRunTimes(data) {
  const sorted = _.sortBy(data.runTimes, ['executionTime']);
  let count = 1;
  console.log('** RUN TIME STATS **');
  sorted.map((runTime, index) => {
    /*const next = sorted[++index];
    let percentageImprovement = '';

    if (next) {
      percentageImprovement = `- ${calculatePercentageDifference(
        next.executionTime,
        runTime.executionTime
      )}% faster`;
    }*/

    console.log(
      `${count++}. ${runTime.alias}: ${runTime.executionTime} ${
        data.unitOfTime
      }`
    );
  });
  const slowest = sorted.pop();
  const fastest = sorted[0];
  const fastestVsSlowest = calculatePercentageDifference(
    slowest.executionTime,
    fastest.executionTime
  );
  console.log(
    `${fastest.alias} is ${fastestVsSlowest}% faster than ${slowest.alias} \n`
  );
}

function logTotalRunTime(data) {
  console.log(
    `Total time: ${getRunDuration(data.startTime, data.unitOfTime)} ${
      data.unitOfTime
    } \n`
  );
}

function calculatePercentageDifference(x, y) {
  return Math.round(((x - y) / y) * 100);
}

function workComplete(err, data) {
  if (err) throw err;
  logAverageRunTimes(data);
  // logTotalRunTime(data);
  logMemoryStats();

  kill();
}

function kill() {
  setTimeout(() => {
    // eslint-disable-next-line
    process.exit(1);
  }, 1000);
}

module.exports = {
  connect,
  getDataSet,
  doWork,
  recordRunTime,
  CG,
  workComplete
};
