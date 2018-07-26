'use strict';

const memwatch = require('memwatch-next');
const _ = require('lodash');

const state = {
  task: undefined,
  memoryStats: {}
};

memwatch.on('stats', stats => {
  stats.min = Math.round(stats.min / 1024 / 1024);
  stats.max = Math.round(stats.max / 1024 / 1024);

  state.memoryStats[state.task] = state.memoryStats[state.task] || {};

  if (state.memoryStats[state.task].min > stats.min) {
    state.memoryStats[state.task].min = stats.min;
  }

  if (state.memoryStats[state.task].max < stats.max) {
    state.memoryStats[state.task].max = stats.max;
  }
});

function logMemoryStats() {
  const sorted = _.sortBy(state.memoryStats, ['min']);
  const mapped = sorted.map(taskStat => {
    return `${taskStat.task}: ${taskStat.executionTime} MB`;
  });
  console.log(`Memory Stats: ${mapped}`);
}

module.exports = {
  logMemoryStats
};
