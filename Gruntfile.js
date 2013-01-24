module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        test: {
            files: ['test/**/*.js']
        },
        lint: {
        },
        reload: {
            proxy: {}
        },
        connect: {
            'default': {
                options: {
                    port: 8000
                }
            }
        },
        watch: {
            files: ['Gruntfile.js', 'tasks/reload.js', '**/*.html'],
            tasks: ['reload']
        },
        jshint: {
            all: ['Gruntfile.js', 'tasks/reload.js'],
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                eqnull:true,
                node:true,
                es5:true,
                strict:true,
                globals: {
                    require: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.loadTasks('test/tasks');

    grunt.registerTask('default', ['connect', 'reload', 'watch']);

};
