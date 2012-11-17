pfclient = require('net').connect({port: 8001});

mode = "";

pfclient.buy = function() {
	mode = 'B';
	pfclient.write('B\n');
}

pfclient.sell = function() {
	mode = 'S';
	pfclient.write('S\n');
}

pfclient.on('data', function(data) {
	console.log mode + data.toString();
});