prices = [];

var client = require('net').connect({port: 8000},
    function() { //'connect' listener
  console.log('client connected');
  client.write('H\n'); //possible 'H\n'
});

client.on('data', function(data) {

	var arr = data
		.toString()
		.replace(/\./gi, "")
		.split("|");

	if(arr.pop() == "C") { //Except when it's C, then it means the exchange closed
		console.log("Exchange closed");
	}

	arr
		.map(function(a) {return parseInt(a);})
	;

	prices = prices.concat(arr);

	//Add arr to buffer
	//Throw event
});

client.on('end', function() {
  console.log('client disconnected');
});

