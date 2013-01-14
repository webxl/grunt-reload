/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 *
 * The trigger task is used to modify a file on the server, from the test/index.html file
 *
 */

'use strict';

module.exports = function (grunt) {

    // can be called from client via reload task
    var trigger = function (path) {
        var html = grunt.file.read(path).replace(/<h1>(.*)<\/h1>/, '<h1>' + new Date() + '</h1>');
        grunt.file.write(path, html);
    };

    grunt.registerTask('trigger', 'Write timestamp to html file in order to trigger watch task.', function (data, name) {
        var errorcount = grunt.fail.errorcount;
        var updatedFile = grunt.config('trigger.watchFile');

        grunt.event.on('reload:trigger', function (connection) {

            var updateTimeout = 2000;
            setTimeout(function () {
                grunt.log.writeln("Trigger task writing to " + updatedFile + ' ');
                trigger(updatedFile);
            }, updateTimeout);

            var msg = 'Trigger task triggered. Delaying ' + updateTimeout + 'ms.';

            grunt.log.writeln(msg);
            connection.sendUTF(msg);

        });

        // Fail task if there were errors.
        if (grunt.fail.errorcount > errorcount) {
            return false;
        }
    });
};
