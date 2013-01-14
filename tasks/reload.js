/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    'use strict';

    // node libs
    var path = require('path');
    var fs = require("fs");
    var taskEvent = new (require("events")).EventEmitter();

    // external libs
    var connect = require('connect');
    var buffers = require('buffers');
    var httpProxy = require('http-proxy');
    var WebSocketServer = require("websocket").server;
    var request = require('request');

    function handleReload(wsServer, files, target) {
        var connections = wsServer.connections;
        var path = files ? files.changed[0] : 'index.html';

        // apply_js_live
        var msg = '{"command": "reload", "path": "' + path + '", "target": "' + target + '"}';

        for (var i = 0; i < connections.length; i++) {
            connections[i].sendUTF(msg);
        }
    }

    // simple router
    function route(method, path, cb) {
        return function (req, res, next) {
            if (req.method !== method) {
                return next();
            }

            if (path instanceof RegExp && req.url.match(path) === null || typeof path === 'string' && req.url !== path) {
                return next();
            }

            cb(req, res, next);
        };
    }

    function startServer(target) {

        // start a server that can send a reload command over a websocket connection as well as proxy to another server
        // and inject reload scripts.

        var middleware = [];

        grunt.config.requires('reload');

        // Get values from config, or use defaults.
        var config = target ? grunt.config(['reload', target]) : grunt.config('reload');
        var port = config.port || grunt.config('reload').port || 8001;
        var base = path.resolve(grunt.config('server.base') || '.');
        var reloadClientMarkup = '<script src="/__reload/client.js"></script>';

        if (!target) {
            target = 'default';
        }

        if (config.proxy) {
            var proxyConfig = config.proxy;
            var connectOpts = grunt.config(['connect', target]).options;
            var proxyOpts = {
                target:{
                    host:proxyConfig.host || 'localhost',
                    port:proxyConfig.port || connectOpts && connectOpts.port || 80,
                    path:proxyConfig.path || '/'
                }
            };
            var proxy = new httpProxy.HttpProxy(proxyOpts);
            var targetUrl = 'http://' + proxyOpts.target.host + ':' + proxyOpts.target.port + proxyOpts.target.path;

            // modify any proxied HTML requests to include the client script
            middleware.unshift(connect(
                function (req, res) {

                    if (proxyConfig.includeReloadScript !== false) {
                        // monkey patch response, postpone header
                        var _write = res.write, _writeHead = res.writeHead, _end = res.end,
                            _statusCode, _headers, tmpBuffer;

                        res.write = function (data) {
                            if (tmpBuffer) {
                                tmpBuffer.push(data);
                            } else {
                                _write.call(res, data);
                            }
                        };

                        res.writeHead = function (statusCode, headers) {
                            _statusCode = statusCode;
                            _headers = headers;
                            if (/html/.test(_headers["content-type"])) {
                                // defer html & headers
                                tmpBuffer = buffers();
                            } else {
                                _writeHead.call(res, _statusCode, _headers);
                            }
                        };

                        res.end = function () {
                            if (tmpBuffer) {
                                var html = tmpBuffer.toString();

                                html = html.replace('</body>', reloadClientMarkup + '</body>');

                                // since nodejs only support few charsets, we only support
                                // UTF-8 at this moment.
                                // TODO: support other charsets besides UTF-8
                                _headers['content-length'] = Buffer.byteLength(html, 'utf-8');

                                _writeHead.call(res, _statusCode, _headers);
                                _write.call(res, html);
                            }
                            _end.call(res);
                        };
                    }

                    proxy.proxyRequest(req, res);
                }
            ));

            grunt.log.writeln("Proxying " + targetUrl);

        } else {
            middleware.unshift(connect.static(base, { redirect:true }));
        }

        if (config.iframe) {
            // serve iframe
            middleware.unshift(route('GET', '/', function (req, res, next) {
                var targetUrl = config.iframe.target;
                res.end('<html><body style="margin:0;">' +
                    '<iframe style="border:none;" height="100%" width="100%" src="' + targetUrl + '"></iframe>' +
                    reloadClientMarkup + '</body></html>');
            }));
        }

        if (config.liveReload) {
            // required by LR 2.x
            middleware.unshift(route('GET', /\/livereload.js(\?.*)?/, function (req, res, next) {
                res.write('__reloadServerUrl="ws://localhost:' + config.port + '";\n');
                fs.createReadStream(__dirname + "/include/livereload.js").pipe(res);
            }));
        }

        // provide route to client js
        middleware.unshift(route('GET', '/__reload/client.js', function (req, res, next) {
            res.setHeader('content-type', 'application/javascript');
            fs.createReadStream(__dirname + "/include/reloadClient.js").pipe(res); // use connect.static.send ?
        }));

        // route to trigger reload
        middleware.unshift(route('POST', '/triggerReload', function (req, res, next) {
            taskEvent.emit('reload', req.body.files, req.body.target);
            res.end("reload triggered");
        }));

        // if --debug was specified, enable logging.
        if (grunt.option('debug')) {
            connect.logger.format('grunt', ('[D] reloadServer :method :url :status ' +
                ':res[content-length] - :response-time ms').blue);
            middleware.unshift(connect.logger('grunt'));
        }

        middleware.unshift(connect.bodyParser());

        // kick-off
        var server = connect.apply(null, middleware).listen(port);

        var wsServer = new WebSocketServer({
            httpServer:server,
            autoAcceptConnections:true
        });

        wsServer.on('connect', function (request) {

            var connection = request; //.accept(); //.accept('*', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', function (message) {
                if (message.type === 'utf8') {

                    var data = JSON.parse(message.utf8Data);

                    if (data.command) {
                        grunt.event.emit('reload:' + data.command, connection);
                    }

                    // LiveReload support
                    if (data.command === 'hello') {
                        var handshake = {
                            command:'hello',
                            protocols:[ 'http://livereload.com/protocols/official-7'],
                            serverName:'grunt-reload'
                        };
                        return connection.sendUTF(JSON.stringify(handshake));
                    }
                    if (data.command === 'hello') {
                        return;
                    }
                }
            });
            connection.on('close', function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });

        taskEvent.on('reload', function (files, target) {
            handleReload(wsServer, files, target);
        });

        grunt.log.writeln("Reload server running at http://localhost:" + port);

    }

    grunt.registerTask('reload', "Reload connected clients when a file has changed.", function (target) {

        var done = this.async();
        var that = this;
        grunt.config.requires('reload');

        // Get values from config, or use defaults.
        var config = target ? grunt.config(['reload', target]) : grunt.config('reload');
        var port = config.port || grunt.config('reload').port || 8001;

        // First, try to trigger reload in already running server process
        var triggerUrl = 'http://localhost:' + port + '/triggerReload';
        console.log('Attempting reload at ' + triggerUrl);

        request.post(
            {
                url:triggerUrl,
                json:{
                    files:grunt.file.watchFiles,
                    target:target
                }
            },
            function (error, response) {
                if (!error && response.statusCode === 200) {
                    // Reload was triggered successfully
                    grunt.log.writeln("Triggered reload in running reload-server");
                } else {
                    // Server doesn't seem to be running, start our own
                    startServer.call(that, target);
                }
                done();
            }
        );

    });
};
