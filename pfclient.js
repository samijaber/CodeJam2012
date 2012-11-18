"use strict";

GLOBAL._ = require('underscore');

var Strategies = require('./strategies').Strategies;
var net = require('net');
var report = require('./helpers/report');

var pricefeed = [];
var crt = -1;

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

	var arr = data.toString().split("|");

	if(arr.pop() == "C") { //Empty string, except when it's C, then it means the exchange closed
		bsclient.end();
		pfclient.end();
	}

	arr = arr.map(function(a) { return parseFloat(a); });

	_.map(arr, function(val) {
		pricefeed.push(val);
		Strategies.populate(_.last(pricefeed, 21));
		crt++;
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
			buy(Strategies.SMA.name);
		} else {
			sell(Strategies.SMA.name);
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
	bstimes.push(crt);
}

bsclient.on('data', function(data) {
	if(data.toString() == "E") {
		console.log("E");
	}
	bsprices.push(data);
});

bsclient.on('end', function() {
	var pricesfmt = [];
	_.map(bsprices, function(price) {
		pricesfmt = pricesfmt.concat(
			_.map(price.toString().match(/\d+\.\d{3}/g), parseFloat)
		)
	});

	pricesfmt = _.compact(pricesfmt);

	var transactionInfo = report.formatTransactionInfo(bstypes, bsprices, bstimes, bsstrategies);
	console.log(_.first(transactionInfo, 10));
});



