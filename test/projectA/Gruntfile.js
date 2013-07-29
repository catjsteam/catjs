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

    // Project configuration.
    grunt.initConfig({
        project: {
            name: "test-1",
            outName: "cat.test",
            deployPath: "./deploy/",
            targetPath: "./target/"
        },

        pkg: grunt.file.readJSON('package.json'),

        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        jshint: {
            all: [
                '<%=project.targetPath%><%= project.name %>/**/*.js'
            ],
            options: {
                "strict": false,
                "curly": true,
                "eqeqeq": true,
                "immed": false,
                "latedef": true,
                "newcap": true,
                "noarg": true,
                "sub": true,
                "undef": true,
                "boss": true,
                "eqnull": true,
                "node": true,
                "es5": true,
                globals: {}
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['<%=project.targetPath%><%= project.name %>/**/*.js'],
                dest: '<%= project.deployPath %><%= project.outName %>.js'
            }
        },
        uglify: {
            dist: {
                src: ['<%= project.deployPath %><%= project.outName %>.js'],
                dest: '<%= project.deployPath %><%= project.outName %>.min.js'
            }
        },
        clean: ["<%= project.deployPath %>",
            _logFileName
        ]

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.registerTask('install', function () {
        grunt.task.run(['jshint', 'concat', 'uglify']);
    });

    grunt.registerTask('cat.compile', function () {
        grunt.util.spawn({
            cmd: 'catcli', args: ['-isp'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        }, function () {
            grunt.util.spawn({
                cmd: 'catcli', args: ['-jp'], opts: { stdio: [ process.stdin
                    , process.stout
                    , process.stderr
                ]}
            }, function () {


            });

        });
    });

    grunt.registerTask('cat.clean', function () {
        grunt.util.spawn({
            cmd: 'catcli', args: ['-cp'], opts: { stdio: [ process.stdin
                , process.stout
                , process.stderr
            ]}
        });

    });

};
