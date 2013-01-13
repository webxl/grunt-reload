/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // can be called from client via reloadServer
    var trigger = function (path) {
        var html = grunt.file.read(path).replace(/<h1>(.*)<\/h1>/, '<h1>' + new Date() + '</h1>');
        grunt.file.write(path, html);
    };

    grunt.registerTask('trigger', 'Write timestamp to html file in order to trigger watch task.', function (data, name) {
        var errorcount = grunt.fail.errorcount;
        var updatedFile = grunt.config('trigger.watchFile');

        grunt.event.on('trigger', function (connection) {

            setTimeout(function () {
                trigger(updatedFile);
            }, 5000);

            connection.sendUTF('Update triggered');
        });

        grunt.log.writeln("Trigger task triggered. Writing to " + updatedFile + ' ');

        // Fail task if there were errors.
        if (grunt.fail.errorcount > errorcount) {
            return false;
        }
    });
};
