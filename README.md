# do-you-even-async-bro
## Overview
This is a basic NodeJS application created to compare the performance of various coding styles, patterns and techniques used in NodeJs.

Currently this repository compares the peformance of loops and streams. The intent is to highlight the performance that can be achieved if you follow the intended NodeJS coding style of event driven scalable I/O operations.

## Requirements
1. Node >= v7.6.0
2. NPM >= v6.1.0

## Setup 
1. run `npm i` on the root of the project.

## Usage
1. Use your own mongo connection string in common/utils.js.
2. Run `node --expose-gc .` on the root of the project.
    1. `--expose-gc` argument allows the code to invoke the Garbage Collector manually.
3. Select the task to run using the arrow keys or enter the corresponding number.
4. Appreciate the stats.
5. profit..