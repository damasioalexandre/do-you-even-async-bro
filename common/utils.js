'use strict';
const moment = require('moment');
const MongoClient = require('mongodb');
const connectionString = 'mongodb://localhost:27017/money-machine';
const _ = require('lodash');

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
    .limit(100000)
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

function recordRunTime(data, time, alias, unitOfTime) {
  data.runTimes.push({
    alias,
    executionTime: getRunDuration(time, unitOfTime)
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

function getAverageRunTimes(data, unitOfTime = 'ms') {
  const sorted = _.sortBy(data.runTimes, ['executionTime']);
  const mapped = sorted.map(runTime => {
    return `${runTime.alias}: ${runTime.executionTime} ${unitOfTime}`;
  });
  console.log(mapped);
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
  getRunDuration,
  CG,
  getAverageRunTimes,
  kill
};
