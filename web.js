const DEFAULT_HOST = 'weheartpics.com';

var getContent = function(url, callback) {
	var content = '';
	// Here we spawn a phantom.js process, the first element of the 
	// array is our phantomjs script and the second element is our url 
	var phantom = require('child_process').spawn('phantomjs', ['phantom-server.js', url]);
	// var phantom = require('child_process').spawn('phantomjs', ['phantom-server.js', url]);
	phantom.stdout.setEncoding('utf8');
	// Our phantom.js script is simply logging the output and
	// we access it here through stdout
	phantom.stdout.on('data', function(data) {
		content += data.toString();
	});
	phantom.on('exit', function(code) {
		if (code !== 0) {
			console.log('We have an error ' + code);
		} else {
			// once our phantom.js script exits, let's call out call back
			// which outputs the contents to the page
			callback(content);
		}
	});
};

var http = require('http'),
	httpProxy = require('http-proxy');
//
// Create a proxy server with custom application logic
//
httpProxy.createServer(function (req, res, proxy) {

	var host = req.headers['x-forwarded-host'];
	if(!host) {
		host = DEFAULT_HOST;
	}

	// for css and images sources on client side we give you
	if(!!req.url.match(/(.*\.(css|png|jpeg|jpg|ico|xml|html|txt))/)) {
		console.log('resource: ' + req.url)
		proxy.proxyRequest(req, res, {
			host: host,
			port: 80
		});
	// for js sources on client side we give you an almost blank script
	} else if(!!req.url.match(/(.*\.(js|jscript))/)) {
		res.writeHead(200, { 
			'Content-Type': 'application/javascript',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'X-Requested-With'
		 });
		res.write('console.log("hello crawler");');
		res.end();
	} else {
		console.log('host: ' + host);
		console.log('user-agent:' + req.headers['user-agent']);
		getContent('http://' + host + req.url, function (content) {
			res.writeHead(200, { 
				'Content-Type': 'text/html',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'X-Requested-With'
			});
			res.write(content);
			res.end();
		});	
	}

}).listen(3333);


