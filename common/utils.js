'use strict';
const moment = require('moment');
const async = require('async');
const MongoClient = require('mongodb');
const _ = require('lodash');
const connectionString = 'mongodb://localhost:27017/money-machine';
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

function getRunDuration(startTime, unitOfTime = 'ms') {
  return moment().diff(startTime, unitOfTime);
}

function logRunTimes(data) {
  async.each(data.runTimes, (runTime, next) => {
    console.log(`${runTime.alias} ran in ${runTime.executionTime}`);
    next();
  });
}

function recordRunTime(data, time, alias, unitOfTime) {
  data.runTimes.push({
    alias,
    executionTime: getRunDuration(time, unitOfTime)
  });
}

function kill() {
  setTimeout(() => {
    // eslint-disable-next-line
    process.exit(1);
  }, 1000);
}

function getAverageRunTime(data, loopName, callback) {
  let total = 0;
  const loopRunTimes = data.runTimes.filter(runTime => {
    if (runTime.alias === loopName) {
      total = total + runTime.executionTime;
      return runTime.executionTime;
    }
  });
  const runTime = total / loopRunTimes.length;
  return callback(null, runTime);
}

module.exports = {
  connect,
  getDataSet,
  logRunTimes,
  recordRunTime,
  kill,
  getAverageRunTime,
  getRunDuration
};
