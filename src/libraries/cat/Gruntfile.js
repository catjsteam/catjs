'use strict';

var _fs = require("fs"),
    _path = require("path"),
    _logFileName = "./../../../cat.libraries.log",
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
    _fs.writeSync(_logFileStream, _path.resolve("."));
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
        //console.log("[grunt process] see cat.test.log for details: ", str);

        return ret;
    });
}

module.exports = function (grunt) {

    logStreamHook(grunt);

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false
            },
            dist: {
                src: ['Cat.js', 'core/test/TestManager.js'],
                dest: 'target/cat.core.test.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'target/cat.core.test.js',
                dest: 'target/cat.core.test.min.js'
            }
        },
        jshint: {
            options: {
                "strict": false,
                "curly": true,
                "eqeqeq": true,
                "immed": false,
                "latedef": true,
                "newcap": false,
                "noarg": true,
                "sub": true,
                "undef": true,
                "boss": true,
                "eqnull": true,
                "node": true,
                "es5": true,
                globals: {}
            },
            all: {
                src: ['Cat.js', 'core/test/TestManager.js']
            }
        },
        clean: ["target"]
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('install', ['clean', 'jshint', 'concat', 'uglify']);

};
