var net = require('net');
var client = net.connect({port: 8000},
    function() { //'connect' listener
  console.log('client connected');
  client.write('H\n'); //possible 'H\n'
});

client.on('data', function(data) {

	arr = data
		.toString()
		.replace(/\./gi, "")
		.split("|");

	endstr = arr.pop(); //Last element of this array is always an empty string...
	if(endstr == "C") { //Except when it's C, then it means the exchange closed
		console.log("Exchange closed");
	}

	arr
		.map(function(a) {return parseInt(a);})
	;

	//Add arr to buffer
	//Throw event
	client.end();
});

client.on('end', function() {
  console.log('client disconnected');
});