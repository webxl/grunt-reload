module.exports = function (grunt) {

    grunt.initConfig({
        jshint:{
            all:['grunt.js', 'main.js']
        },
        reload: {
            port: 10000,
            includeReloadScript: true,
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
                },
                watchFiles: ['*.css']
            },
            proxyOnlyTest: {
                port: 9001,
                proxy: {
                    // include file manually
                    // see http://localhost:9001/included.html
                    includeReloadScript: false
                }
            },
            connectProxyTest: {
                // parent 10000 -> connect port 9999
                proxy: {}
            }
        },
        connect:{
            default:{
                options:{
                    port:9999
                }
            },
            connectProxyTest:{
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
            less: {
                files:['style.less', 'style1.less', '*.html', '*.css'],
                tasks:['less', 'reload:liveReloadTest'],
                options:{
                    interrupt:true,
                    debounceDelay:1000
                }
            }
//            ,
//            reloadCss:{
//                files:['<config:lint.files>'],
//                tasks:[],
//                options:{
//                    interrupt:true,
//                    //debounceDelay:250
//                }
//            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('../tasks');
    grunt.loadTasks('../test/tasks');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['connect:connectProxyTest', 'reload:connectProxyTest', 'trigger', 'watch:default']);
    grunt.registerTask('liveReload', ['connect:default', 'reload:liveReloadTest', 'watch:less', 'watch:reloadCss']);
    grunt.registerTask('noProxy', ['connect:default', 'reload', 'trigger', 'watch:default']);
    grunt.registerTask('iframe', ['connect:default', 'reload:iframeTest', 'watch:default']);
    grunt.registerTask('proxyOnly', ['connect:default', 'reload:proxyOnlyTest', 'watch:default']);

};
