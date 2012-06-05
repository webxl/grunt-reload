/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    var throttle = false;

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('reload', "Reload connected clients when a file has changed.", function (data, name) {
        var errorcount = grunt.fail.errorcount;
        // throttle was needed early in development because of rapid triggering by the watch task. Not sure if it's still necessary
        if (!throttle) {
            grunt.helper('reload');
            throttle = true;
            setTimeout(function () {
                throttle = false;
            }, 2000);
            grunt.log.writeln("File updated. Reload triggered.");
        } else {
            return;
        }
        // Fail task if there were errors.
        if (grunt.fail.errorcount > errorcount) {
            return false;
        }
    });

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    grunt.registerHelper('reload', function () {
        var http = require('http'),
            fileData = "message=File Updated",
            options = {
                host:'localhost',
                port:grunt.config('reload.port') || 8001,
                method:'POST',
                path:'/__reload',
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Content-Length':fileData.length
                }
            },
            post_req = http.request(options,
                function (proxyResponse) {
                }).on('error', function (e) {
                    console.log("Got error: " + e.message);
                }
            );

        post_req.write(fileData);
        post_req.end();
    });

};
