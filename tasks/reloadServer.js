/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    // node libs
    var path = require('path');
    var http = require('http');
    var fs = require("fs");

    // external libs
    var connect = require('connect');
    var buffers = require('buffers');
    var httpProxy = require('http-proxy');

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('reloadServer', 'Start a server that will send a reload command over a websocket connection.', function () {
        var middleware;

        // Get values from config, or use defaults.
        var port = grunt.config('reload.port') || 8001;
        var base = path.resolve(grunt.config('server.base') || '.');


        if (grunt.config('reload.proxy')) {
            var options = {
                target:{
                    host:grunt.config('reload.proxy.host') || 'localhost',
                    path:grunt.config('reload.proxy.path') || '/', // not yet supported by http-proxy: https://github.com/nodejitsu/node-http-proxy/pull/172
                    port:grunt.config('reload.proxy.port') || grunt.config('server.port') || 80
                }
            };

            var proxy = new httpProxy.HttpProxy(options);

            middleware = connect(
                function (req, res) {

                    if (grunt.config('reload.proxy.includeReloadScript') !== false) {
                        // monkey patch response, postpone header
                        var _write = res.write, _writeHead = res.writeHead, _end = res.end, _statusCode, _headers, tmpBuffer;

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
                                var html = tmpBuffer.toString(),
                                    scriptTag = '<script src="/__reload/client.js"></script>';

                                html = html.replace('</body>', scriptTag + '</body>');
                                _headers['content-length'] = html.length;
                                _writeHead.call(res, _statusCode, _headers);
                                _write.call(res, html);
                            }
                            _end.call(res);
                        };
                    }

                    proxy.proxyRequest(req, res);
                }
            );

        } else {
            middleware = connect.static(base, { redirect: true });
        }

        // simple router
        function route(method, path, cb) {
            return function (req, res, next) {
                if (req.method !== method || req.url !== path) {
                    return next();
                }
                cb(req, res, next);
            };
        }

        var reloadTaskPost = route('POST', '/__reload', function (req, res, next) {
            var msg = req.body.message,
                connections = wsServer.connections;

            for (var i = 0; i < connections.length; i++) {
                connections[i].sendUTF(msg);
            }

            res.end('');
        });

        var clientStub = route('GET', '/__reload/client.js', function (req, res, next) {
            fs.createReadStream(__dirname + "/include/reloadClient.js").pipe(res); // use connect.static.send ?
        });

        // kick-off

        var site = connect()
            .use(connect.bodyParser())
            .use(reloadTaskPost)
            .use(clientStub)
            .use(middleware)
            .listen(port);

        var WebSocketServer = require("websocket").server;

        var wsServer = new WebSocketServer({
            httpServer:site,
            autoAcceptConnections:true
        });

        wsServer.on('connect', function(request) {

            var connection = request; //.accept(); //.accept('*', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    if (message.utf8Data === 'trigger') {
                        grunt.helper('trigger', grunt.config('trigger.watchFile'));
                        connection.sendUTF('Update triggered');
                    }
                }
            });
            connection.on('close', function(reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });

        grunt.log.writeln("For live reload, visit http://localhost:" + port);

    });

};
