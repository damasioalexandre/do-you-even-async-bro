'use strict';

const moment = require('moment');
const async = require('neo-async');
const { connect, recordRunTime, workComplete } = require('../common/utils');
const fs = require('fs');
const parse = require('csv-parse');
const parseOptions = {
  delimiter: ';',
  from: 2,
  columns: true
};
const totalCsvRecords = 20000;
const streamNames = {
  streamToMongo: 'streamToMongo',
  streamToFile: 'streamToFile'
};

run();

function run() {
  const data = {
    runTimes: [],
    startTime: moment(),
    unitOfTime: 'ms',
    writeFileName: './data/temp.txt',
    limit: 20000
  };
  async.waterfall(
    [
      async.apply(connect, data),
      dropAndCreateTempCollection,
      deleteFile,
      streamInOut
    ],
    workComplete
  );
}

function streamInOut(data, callback) {
  const { db, writeFileName } = data;
  let count = 1;
  const now = moment();
  const stream = fs.createReadStream('./data/data.csv');
  const writeStream = fs.createWriteStream(writeFileName);

  stream.pipe(writeStream);
  stream
    .pipe(parse(parseOptions))
    .on('data', record => {
      db.collection('temp').insertOne(record, err => {
        if (err) return callback(err);
        if (++count === totalCsvRecords) {
          recordRunTime(data, now, streamNames.streamToMongo);
          return callback(null, data);
        }
      });
    })
    .on('error', err => {
      return callback(err);
    });
}

function dropAndCreateTempCollection(data, callback) {
  data.db.dropCollection('temp', () => {
    data.db.createCollection('temp', err => callback(err, data));
  });
}

function deleteFile(data, callback) {
  fs.unlink(data.writeFileName, err => callback(err, data));
}
