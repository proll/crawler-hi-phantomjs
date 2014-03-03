var page = require('webpage').create();
var system = require('system');

page.settings.loadImages = true;
page.settings.localToRemoteUrlAccessEnabled = true;
// mask request as MSNBot to make YandexMetrika know that it is just a Bot - not an ordinary user
// page.settings.userAgent = 'msnbot-media/1.1 (+http://search.msn.com/msnbot.htm)';
page.viewportSize = { width: 1440, height: 1200 };

var lastReceived = new Date().getTime();
var requestCount = 0;
var responseCount = 0;
var requestIds = [];
var startTime = new Date().getTime();

page.onResourceReceived = function (response) {
	if(requestIds.indexOf(response.id) !== -1) {
		lastReceived = new Date().getTime();
		responseCount++;
		requestIds[requestIds.indexOf(response.id)] = null;
	}
};
page.onResourceRequested = function (request) {
	if(requestIds.indexOf(request.id) === -1) {
		requestIds.push(request.id);
		requestCount++;
	}
};

page.onConsoleMessage = function(msg){
    console.log(msg);
};

// Open the page
page.open(system.args[1], function () {});

var checkComplete = function () {
	// We don't allow it to take longer than 5 seconds but
	// don't return until all requests are finished
	if((new Date().getTime() - lastReceived > 300 && requestCount === responseCount) || new Date().getTime() - startTime > 50000)  {
		clearInterval(checkCompleteInterval);
		console.log(page.content);
		if(!!page.release) {
			page.release();
		} else if(!!page.close) {
			page.close();
		}
		phantom.exit();
	}
}
// Let us check to see if the page is finished rendering
var checkCompleteInterval = setInterval(checkComplete, 100);