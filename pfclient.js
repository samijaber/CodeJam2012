"use strict";

var Strategies = require('./strategies').Strategies;
var _ = require('underscore');
var net = require('net');

var pricefeed = [];

function logbuy() {
	console.log("buy");
}

function logsell() {
	console.log("sell");
}

var pfclient = net.connect({port: 8000},
    function() { //'connect' listener
  console.log('pfclient connected');
  pfclient.write('H\n');
});

pfclient.setEncoding('ascii');

pfclient.on('data', function(data) {

	var arr = data
		.toString()
		.split("|");

	if(arr.pop() == "C") { //Empty string, except when it's C, then it means the exchange closed
		bsclient.end();
		pfclient.end();
	}

	arr = arr
		.map(function(a) {return parseFloat(a);})
	;

	_.map(arr, function(val) {
		pricefeed.push(val);
		Strategies.populate(_.last(pricefeed, 21));
	});

	xOver(
		_.last(Strategies.SMA.fast), 
		_.last(Strategies.SMA.slow), 
		bsclient.buy,
		bsclient.sell
	);
});

pfclient.on('end', function() {
	console.log('pfclient disconnected');
});

var fastAboveSlow; //Initialize to the right value!

function xOverArray(fastarr, slowarr, buy, sell) {
	if(fastarr.length != slowarr.length) {
		throw "length of the fast and slow datasets are different";
	}

	if(typeof fastAboveSlow === 'undefined') {
		fastAboveSlow = fastarr[0] > slowarr[0];
	}

	_.map(_.zip(fastarr, slowarr), function(arr) {
		xOverHelper(arr[0], arr[1], buy, sell);
	});
}

function xOver(fast, slow, buy, sell) {
	if(typeof fastAboveSlow === 'undefined') {
		fastAboveSlow = fast > slow;
		return;
	}

	xOverHelper(fast, slow, buy, sell);
}

function xOverHelper(fast, slow, buy, sell) {
	if(fastAboveSlow != fast > slow) {
		fastAboveSlow = !fastAboveSlow;
		if(fastAboveSlow) { //If fast just overtook slow
			buy();
		} else {
			sell();
		}
	}
}

var bsclient = net.connect({port: 9000});

bsclient.setEncoding('ascii');

var bstypes = [],
	bsprices = [],
	bstimes = [],
	bsstrategies = [];

bsclient.buy = function(strategy) {
	bsclient.write('B\n');
	bstypes.push("buy");
	bsstrategies.push(strategy);
}

bsclient.sell = function(strategy) {
	bsclient.write('S\n');
	bstypes.push("sell");
	bsstrategies.push(strategy);
}

bsclient.on('data', function(data) {
	bsprices.push(data);
	bstimes.push(pricefeed.length); //not exact, possibly a few seconds too high
});

bsclient.on('end', function() {
	var pricesfmt = [];
	_.map(bsprices, function(price) {
		try {
			pricesfmt.push(price.toFixed(3).parseFloat());
		} catch (err) {
			pricesfmt = pricesfmt.concat(
				_.map(
					price.toString().match(/\d+\.\d{3}/g),
					function(a) {return a.parseFloat();}
				)
			);
		}
	});
	pricesfmt = _.compact(pricesfmt).length;
	console.log(bstypes.length);
	bstypes = _.first(bstypes, pricesfmt.length);
	bstimes = _.first(bstimes, pricesfmt.length);
});

function formatTransactionInfo(tmodes, tprices, ttimes) {
	transactionInfo = _.map(
		_.zip(tmodes, tprices, ttimes),
		function (arr) {
			var o = {};
			o.type = arr[0];
			o.price = arr[1];
			o.time = arr[2];
			return o;
		}
	);
}

function selectManager(time, strategy) {
	var managerPeriod;
	var timePeriod = time/1800;
	if(timePeriod <= 3 && timePeriod >= 0 || timePeriod <= 8 && timePeriod >= 5) {
		managerPeriod = 0;
	} else if (timePeriod == 4) {
		managerPeriod = 1;
	} else if (timePeriod <= 12 && timePeriod >= 9 || timePeriod <= 17 && timePeriod >= 14) {
		managerPeriod = 2;
	} else if (timePeriod == 13) {
		managerPeriod = 3;
	} else {
		throw "selectManager: invalid time period";
	}

	managerPeriod *= 2;

	if (strategy == "EMA" || strategy == "TMA") {
		managerPeriod++;
	}

	managerPeriod++;

	return "Manager" + managerPeriod;
}