'use strict';

var _fs = require("fs"),
    _logFileName = "./cat.test.log",
    _logFileStream = _fs.openSync(_logFileName, 'a');

function logStreamHook(grunt) {

    var hooker = require('hooker');
    _fs.writeSync(_logFileStream, [" ", new Date(), ""].join("\n"));
    _fs.writeSync(_logFileStream, ["--------------------------------------------------------------", ""].join("\n"));

    // Override grunt.log.header to update a per-line prefix and prevent default logging.
    var prefix;
    hooker.hook(grunt.log, 'header', function () {
        prefix = '[' + grunt.task.current.nameArgs + '] ';
        return hooker.preempt();
    });

    // Override process.stdout to log the name+args of the current task before
    // every logged line.
    var newline = true;
    hooker.hook(process.stdout, 'write', function (str) {
        var ret;
        str = String(str);
        if (newline) {
            if (str === '\n') {
                return hooker.preempt();
            } else if (prefix) {
                str = prefix + str.replace(/(\n)(?!$)/g, '$1' + prefix);
            }
        }

        newline = str.slice(-1) === '\n';
        ret = hooker.filter(this, [str]);

        _fs.writeSync(_logFileStream, str);

        return ret;
    });
}

module.exports = function (grunt) {

    logStreamHook(grunt);


    /**
     * TODO Refactor Needed - call cat by using its module require("cat")
     */

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cat: grunt.file.readJSON('catproject.json')

    });



    grunt.registerTask('install', function () {

        this.async();
        grunt.util.spawn({
            cmd: 'catcli', args: ['-b'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function () {


        });
    });

    grunt.registerTask('test', function () {

        this.async();

        grunt.util.spawn({
            cmd: 'catcli', args: ['-t'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function () {

        });
    });

    grunt.registerTask('start', function () {

        this.async();

        grunt.util.spawn({
            cmd: 'catcli', args: ['--task', 't@server.start'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function() {

        });

    });

    grunt.registerTask('stop', function () {

        this.async();

        grunt.util.spawn({
            cmd: 'catcli', args: ['--task', 't@server.stop'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function() {

        });

    });

    grunt.registerTask('clean', function () {

        this.async();

        grunt.util.spawn({
            cmd: 'catcli', args: ['-c'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function() {

        });

    });

    grunt.registerTask('wipe', function () {

        this.async();

        grunt.util.spawn({
            cmd: 'catcli', args: ['--task', 't@wipe'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function() {

        });

    });

};
