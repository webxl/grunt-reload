# grunt-reload

A task and reverse proxy that enables live reloading in the browser.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-reload`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-reload');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

This plugin provides two grunt tasks: 'reload' and 'reloadServer'. 'reload' is designed to be called via the watch task configuration. 'reloadServer' is designed to be called on the command-line along with the watch task.

The reload task tells the page to refresh itself via websocket connection between the reloadServer task

Configuration:

* __port__: (optional, default: 8000) Reverse proxy listens on this port. This is necessary for including reload client javascript.
* __proxy__: (required) This tells the proxy where to grab your development server's content
  * __host__: (required) development server hostname
  * __port__: (optional, default: 80) development server port
  * __includeReloadScript__: (optional, default: true) includes the client js to listen for reload commands

## Example

Here's how you would use grunt-reload with grunt-less:

```javascript
// project configuration
grunt.initConfig({
    lint: {
        all:['js/*.js']
    },
    reload: {
        port: 6001,
        proxy: {
            host: 'localhost',
        }
    },
    watch:{
        files:['index.html', 'style.less'],
        tasks:'default reload'
    }

});

grunt.loadNpmTasks('grunt-less');
grunt.loadNpmTasks('grunt-reload');

grunt.registerTask('default', 'lint less');
```

## Usage

`grunt reloadServer watch`


## TODO
* reload resources without refreshing entire page
* add option to run standalone web server for project
* use bookmarklet or chrome extension to reload resources

## Release History
05/26/2012 - 0.1.0: Initial release.

## License
Copyright (c) 2012 webxl  
Licensed under the MIT license.
