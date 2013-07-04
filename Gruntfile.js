/*
 * grunt-plugin
 * https://github.com/arik/grunt-plugin
 *
 * Copyright (c) 2013 arik
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js'
            ],
            options: {
                "curly": true,
                "eqeqeq": true,
                "immed": true,
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
                src: ['tasks/*.js'],
                dest: 'dest/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: ['src/module/fs/action/copy.js'],
                dest: 'dest/src/module/fs/action/copy.min.js'
            }

        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp', 'dest']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('install', ['clean', 'jshint', 'concat', 'uglify']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test'], function () {

        var log = require("./src/module/CATGlob.js").log(),
            isasync;

        // Tell grunt this task is asynchronous.
        isasync = this.async();

        log.info("[Grunt] default task; initialized");
        var x = require("./src/module/CAT.js");
        x.init({target: 'scan', grunt: grunt});

    });

};
