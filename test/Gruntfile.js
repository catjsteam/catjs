'use strict';

module.exports = function (grunt) {

    // These plugins provide necessary tasks.
   // grunt.loadNpmTasks('grunt-contrib-clean');
    var Base = function(entity, args) {
        this.admin = false;
        this.spawnopt = {cwd: "./" + entity + "/cat-project"};
        this.args = args;
        this.command = "catcli";
    };

    grunt.registerTask('default', function() {

        this.async();

        console.log("[CAT Enyo Install] Started ");
        require('package-script').spawn([
            new Base("enyo", ["-c"]),
            new Base("enyo", ["-isj"]),
            new Base("enyo", ["-t"])

        ], {}, function() {

            console.log("[CAT Enyo Install] Done ");
            console.log("[CAT Sencha Install] Started ");
            require('package-script').spawn([
                new Base("sencha", ["-c"]),
                new Base("sencha", ["-isj"]),
                new Base("sencha", ["-t"])
            ], {}, function() {
                console.log("[CAT Sencha Install] Done ");
            });

        });
    });
    grunt.registerTask('install', function() {

        this.async();

        console.log("[CAT Enyo Install] Started ");
        require('package-script').spawn([
            new Base("enyo", ["-c"]),
            new Base("enyo", ["-isj"])
        ], {}, function() {

            console.log("[CAT Enyo Install] Done ");
            console.log("[CAT Sencha Install] Started ");
            require('package-script').spawn([
                new Base("sencha", ["-c"]),
                new Base("sencha", ["-isj"])
            ], {}, function() {
                console.log("[CAT Sencha Install] Done ");
            });

        });
    });
   grunt.registerTask('clean', function() {


        this.async();

        console.log("[CAT Enyo Clean] Started ");
        require('package-script').spawn([
            new Base("enyo", ["-c"])

        ], {}, function() {

            console.log("[CAT Enyo Clean] Done ");
            console.log("[CAT Sencha Clean] Started ");
            require('package-script').spawn([
                new Base("sencha", ["-c"])
            ], {}, function() {
                console.log("[CAT Sencha Clean] Done ");
            });

        });
    });

};
