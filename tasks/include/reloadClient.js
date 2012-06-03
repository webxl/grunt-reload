/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

(function(window) {

	var reloader = (function Reloader() {

		var l = window.location, url = 'ws://' + l.host;

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
					window.document.location.reload();
				};

				// Todo: reconnect support
			}
		};

	}());

	setTimeout(function() { reloader.connect(); }, 3000);

}(this));
