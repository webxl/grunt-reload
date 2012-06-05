module.exports = function (grunt) {

    grunt.initConfig({
        lint:{
            files:['grunt.js']
        },
        reload: {
            port: 35729,
            proxy: {}
        },
        server:{
            port:8000
        },
        trigger: {
            watchFile: 'trigger.html'
        },
        watch:{
            files:['<config:lint.files>', '*.html', 'style.css'],
            tasks:'lint reload'
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                node:true,
                es5:true
            },
            globals:{
                WebSocket:true
            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('../tasks');
    grunt.loadTasks('../test/tasks');

    // Default task.
    grunt.registerTask('default', 'server reloadServer watch');

};
