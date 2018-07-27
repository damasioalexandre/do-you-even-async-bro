'use strict';

const inquirer = require('inquirer');
const programs = [
  {
    name: '1. Sync loopdy loops',
    value: './1.loops/loops.js'
  },
  {
    name: '2. Async loopdy loops',
    value: './2.async-loops/async-loops'
  },
  {
    name: '3. Why even loop bro',
    value: './3.streams/stream.js'
  },
  {
    name: '4. Stream power!',
    value: './4.stream-power/stream-power.js'
  }
];
const menu = [
  {
    type: 'list',
    name: 'chooseAProgram',
    message: 'Choose a program to run:',
    choices: programs
  }
];

inquirer.prompt(menu).then(programChosen);

function programChosen(answers) {
  const filePath = answers[menu[0].name];
  require(filePath);
}
