_ = require('underscore');

prices = [];
exchangeOpen = false;

pfclient = require('net').connect({port: 8000},
    function() { //'connect' listener
  console.log('pfclient connected');
  exchangeOpen = true;
  pfclient.write('H\n');
});

pfclient.on('data', function(data) {

	var arr = data
		.toString()
		.replace(/\./gi, "")
		.split("|");

	if(arr.pop() == "C") { //Empty string, except when it's C, then it means the exchange closed
		client.end();
	}

	arr = arr
		.map(function(a) {return parseInt(a);})
	;

	prices = prices.concat(arr);

});

pfclient.on('end', function() {
	exchangeOpen = false;
	console.log('client disconnected');
});