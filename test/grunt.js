module.exports = function (grunt) {

    grunt.initConfig({
        jshint:{
            files:['grunt.js', 'main.js']
        },
        reload: {
            port: 10000,
            // test targets
            iframeTest: {
                port: 7001,
                iframe: {
                   target: 'http://localhost:9999'
                }
            },
            liveReloadTest: {
                // test at any URL with LR extension enabled
                port: 35729, // LR default
                liveReload: {
                    apply_css_live: true,
                    apply_images_live: true
                }
            },
            proxyOnlyTest: {
                port: 9001,
                proxy: {
                    // include file manually
                    // see http://localhost:9001/included.html
                    includeReloadScript: false
                }
            },
            serverProxyTest: {
                // default 8001 -> server.port 9999
                proxy: {}
            }
        },
        connect:{
            default:{
                options:{
                    port:9999
                }
            }
        },
        trigger: {
            watchFile: 'trigger.html'
        },
        less: {
            style: {
                files: {
                    'style.css': 'style.less'
                }
            },
            style1: {
                files: {
                    'style1.css': 'style1.less'
                }
            }
        },
        watch:{
            'default':{
                files:['<config:lint.files>', '*.html', 'style.less', 'style1.less'],
                tasks:['less', 'reload'],
                options:{
                    interrupt:true,
                    debounceDelay:250
                }
            },
            liveReloadTest: {
                files:['<config:lint.files>', '*.html', 'style.less', 'style1.less'],
                tasks:['less', 'reload:liveReloadTest']
            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('../tasks');
    grunt.loadTasks('../test/tasks');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['connect', 'reload', 'trigger', 'watch:default']);
    grunt.registerTask('liveReload', ['connect', 'reload:liveReloadTest', 'watch:liveReloadTest']);
    grunt.registerTask('proxyOnly', ['connect', 'reload:proxyOnlyTest', 'watch']);
    grunt.registerTask('connectProxy', ['connect', 'reload:serverProxyTest', 'watch']);
    grunt.registerTask('iframe', ['connect', 'reload:iframeTest', 'watch']);

};
