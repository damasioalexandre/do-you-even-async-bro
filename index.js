'use strict';

// require('./1.loops/loops');
require('./2.async-loops/async-loops');

const inquirer = require('inquirer');
const programs = [
  {
    name: '1. loops',
    value: './1.loops/loops.js'
  },
  {
    name: '2. Async loops',
    value: './2.async-loops/async-loops'
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
