#!/usr/bin/env node

'use strict';

var pjson = require('./package.json');

console.log("[catjs] version: " + pjson.version);
console.log("[catjs] path: " + __dirname);

require("./src/module/CATCli.js").init({dirname:__dirname});
