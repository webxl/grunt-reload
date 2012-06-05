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

The reload task tells the page to refresh itself via websocket connection between the reloadServer task and the reloadClient.js that is appended to the requested html file. When the watch task detects a changed file, it will process its configured tasks, which should include the 'reload' task if it is setup like the example below.

Configuration:

* __port__: (optional, default: 8001) Reverse proxy listens on this port. This is necessary for including reload client javascript.
* __proxy__: (required) This tells the proxy where to grab your development server's content
  * __host__: (required) development server hostname
  * __port__: (optional, default: server.port or 80) development server port
  * __includeReloadScript__: (optional, default: true) includes the client js to listen for reload commands

## Example

Here's how you would use grunt-reload with [grunt-less](https://github.com/jharding/grunt-less):

```javascript
// project configuration
grunt.initConfig({
    lint: {
        all:['js/*.js']
    },
    reload: {
        port: 6001,
        proxy: {
            host: 'localhost'
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

If you want to run a static server using the bundled server task, and enable reloading, you can configure something like this:

```javascript
...
    reload: {
        port: 6001,
        proxy: {
            host: 'localhost',
            port: 8000 // should match server.port config
        }
    },
    watch:{
        files:['index.html', 'style.less'],
        tasks:'lint less reload'
    }
...
grunt.registerTask('default', 'server reloadServer watch');
```

Then just run:

`grunt`

## TODO
* reload resources without refreshing entire page
* ~~add option to run standalone web server for project~~ use server task for now
* make chrome extension to reload resources
    * the includeReloadScript & proxy options will probably become the fallback method of attaching the client
    * may allow one of three attach methods: extension, iframe, or proxy

## Release History
*   __TBD__ - 0.2.0: Add support for LiveReload extension
*   __06/04/2012 - 0.1.2__: Removed connect 1.x requirement (no longer using connect.router). Added test. Clean up.
*   __06/03/2012 - 0.1.1__: Fixes 'socket hang up' error.
*   __05/27/2012 - 0.1.0__: Initial release.

## License
Copyright (c) 2012 webxl  
Licensed under the MIT license.
