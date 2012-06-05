/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('trigger', 'Write timestamp to .', function (data, name) {
        var errorcount = grunt.fail.errorcount;
        var updatedFile = grunt.config('trigger.watchFile');

        setTimeout(function () {
            grunt.helper('trigger', updatedFile);
        }, 5000);

        grunt.log.writeln("Trigger task triggered. Writing to " + updatedFile + ' ');

        // Fail task if there were errors.
        if (grunt.fail.errorcount > errorcount) {
            return false;
        }
    });

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    // can be called from client via reloadServer
    grunt.registerHelper('trigger', function (path) {
        var html = grunt.file.read(path).replace(/<h1>(.*)<\/h1>/, '<h1>' + new Date() + '</h1>');
        grunt.file.write(path, html);
    });

};
