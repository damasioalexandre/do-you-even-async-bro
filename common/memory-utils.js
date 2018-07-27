'use strict';

const memwatch = require('memwatch-next');
const _ = require('lodash');

const state = {
  currentTaskName: undefined,
  memoryStats: {}
};

memwatch.on('stats', stats => {
  if (!state.currentTaskName) return;

  stats.max = Math.round(stats.max / 1024 / 1024);

  if (!state.memoryStats[state.currentTaskName]) {
    state.memoryStats[state.currentTaskName] = { max: 0 };
  }

  if (state.memoryStats[state.currentTaskName].max < stats.max) {
    state.memoryStats[state.currentTaskName].max = stats.max;
  }
});

function logMemoryStats() {
  if (Object.keys(state.memoryStats).length === 0) {
    return;
  }

  const mapped = [];
  let count = 1;
  console.log('** MEMORY USAGE STATS **');
  _.each(state.memoryStats, (value, key) => {
    mapped.push({ alias: key, max: value.max });
  });
  _.each(_.sortBy(mapped, ['max']), stat =>
    console.log(`${count++}. ${stat.alias}: ${stat.max} MB`)
  );
}

function setCurrentTask(taskName) {
  state.currentTaskName = taskName;
}

module.exports = {
  logMemoryStats,
  setCurrentTask
};
