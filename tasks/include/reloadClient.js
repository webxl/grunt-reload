/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 *
 * Basic reloader
 */

(function(window) {

    'use strict';

    var reloader = (function Reloader() {

		var l = window.location, url;

        if (window.__reloadServerUrl) {
            url = window.__reloadServerUrl;
        } else {
            url = 'ws://' + l.host;
        }

		return {
			isSocketConnected:function () {
				return this.socket && this.socket.readyState === WebSocket.OPEN;
			},
			connect:function () {
				if (this.isSocketConnected()) {
					return;
				}
				if (this.connectTimeout) {
					clearTimeout(this.connectTimeout);
				}
				this.socket = new WebSocket(url);

				this.socket.onmessage = function (msg) {
					this.close();
					console.log(msg.data);
                    try {
                        var data = JSON.parse(msg.data);

                        if (data.command == 'reload') {
                            window.document.location.reload();
                        }
                    } catch (e) {
                        console.error(e);
                    }
				};

				// Todo: reconnect support
			}
		};

	}());

	setTimeout(function() { reloader.connect(); }, 2000);

}(this));
