/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */


var path = require('path'),
    http = require('http'),
    fs = require("fs"),
    connect = require('connect'),
    buffers = require('buffers'),
    httpProxy = require('http-proxy');

module.exports = function (grunt) {

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('reloadServer', 'Start a server that will send a reload command over a websocket connection.', function () {
        // Get values from config, or use defaults.
        var port = grunt.config('reload.port') || 8000;
        var base = path.resolve(grunt.config('server.base') || '.');
        var options = {
            target:{
                host:grunt.config('reload.proxy.host') || 'localhost',
                path:grunt.config('reload.proxy.path') || '/', // not yet supported by http-proxy: https://github.com/nodejitsu/node-http-proxy/pull/172
                port:grunt.config('reload.proxy.port') || 80
            }
        };

        var proxy = new httpProxy.HttpProxy(options);

        var proxyStub = function (req, res) {

            // monkey patch response, delay header
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

            proxy.proxyRequest(req, res);
        };

        var stub = connect(connect.router(function (app) {
            app.post("/", function (req, res) {
                var msg = 'refresh', //req.body.message,
                    connections = wsServer.connections;

                for (var i = 0; i < connections.length; i++) {
                    connections[i].sendUTF(msg);
                }

                res.end('');
            });

            // Todo: figure out a better way to handle this
            app.get("/client.js", function (req, res) {
                fs.createReadStream(__dirname + "/include/reloadClient.js").pipe(res);
            });
        }));


        // kick-off

        var site = connect()
            //.use(connect.bodyParser()) // causes issue with proxy POST
            .use('/__reload', stub)
            .use(proxyStub)
            .listen(port);

        var WebSocketServer = require("websocket").server;

        var wsServer = new WebSocketServer({
            httpServer:site,
            autoAcceptConnections:true // DON'T use on production!
        });

        wsServer.on('connect', function () {
            process.stdout.write('|');//(new Date()) + ' Connection accepted. \n');
        });

        grunt.log.writeln("Reload task support enabled. http://localhost:" + port);


    });

};
