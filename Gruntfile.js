    'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        test: {
            files: ['test/**/*.js']
        },
        lint: {
            files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
        },
        reload: {
            proxy: {},
            liveReload: {}
        },
        connect: {
            default: {
                options: {
                    port: 8000
                }
            }
        },
        trigger: {
            watchFile: 'test/trigger.html'
        },
        watch: {
            options: {
                interrupt: true
            },
            'default': {
                files: ['<config:lint.files>'],
                tasks: 'lint reload'
            },
            triggerTest: {
                files: ['test/trigger.html'],
                tasks: 'reload'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true
            },
            globals: {
                WebSocket: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.loadTasks('test/tasks');

    grunt.registerTask('default', ['connect', 'reload', 'watch:default']);
    grunt.registerTask('triggerTest', ['connect', 'reload', 'watch:triggerTest']);

};
