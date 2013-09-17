// web.js

// Express is our web server that can handle request
var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var proxy = new httpProxy.RoutingProxy();


const DEFAULT_HOST = 'favestore.com';


var getContent = function(url, callback) {
	var content = '';
	// Here we spawn a phantom.js process, the first element of the 
	// array is our phantomjs script and the second element is our url 
	var phantom = require('child_process').spawn('./node_modules/phantomjs/bin/phantomjs', ['phantom-server.js', url]);
	phantom.stdout.setEncoding('utf8');
	// Our phantom.js script is simply logging the output and
	// we access it here through stdout
	phantom.stdout.on('data', function(data) {
		content += data.toString();
	});
	phantom.on('exit', function(code) {
		if (code !== 0) {
			console.log('We have an error');
		} else {
			// once our phantom.js script exits, let's call out call back
			// which outputs the contents to the page
			callback(content);
		}
	});
};

var respondPhantom = function (req, res) {
	var host = req.headers['x-forwarded-host'];
	if(!host) {
		host = DEFAULT_HOST;
	}
	url = 'http://' + host + req.params[0];
	console.log('phantomjs: ' + url);
	getContent(url, function (content) {
		res.send(content);
	});
}


var respondProxy = function (req, res) {
	var host = req.headers['x-forwarded-host'];
	if(!host) {
		host = DEFAULT_HOST;
	}
	url = 'http://' + host + req.params[0];
	console.log('http-proxy: ' + url);
    proxy.proxyRequest(req, res, {
        host: url,
        port: 8080
    });
}

app.get(/(.*\.(css|js))/, respondProxy);
app.get(/(.*)/, respondPhantom);
// app.get(/(.*).css/, respond);
app.listen(3333);