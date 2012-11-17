"use strict";

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
		SMA(_.last(pricefeed, 20));
	});

	xOver(
		_.last(SMA_5, arr.length), 
		_.last(SMA_20, arr.length), 
		bsclient.buy,
		bsclient.sell
	);
});

pfclient.on('end', function() {
	console.log('pfclient disconnected');
});


var SMA_5 = [], 
	SMA_20 = [], 
	LWMA_5 = [],
	LWMA_20= [], 
	EMA_5= [],
	EMA_20= [], 
	TMA_5= [], 
	TMA_20 = [];

//SMA function
function SMA(dp20)
{
	var t = dp20.length;

	if(t<= 5)
	{
		var avg = sum(dp20)/t;
		SMA_5.push(avg);
		SMA_20.push(avg);
	}
	else if(t <= 20) 
	{
		var sum5 = sum(_.last(dp20, 5));
		var avg5 = sum5/5;
		var sum20 = sum5 + sum(_.first(dp20, t-5));
		var avg20 = sum20/t;
		SMA_5.push(avg5);
		SMA_20.push(avg20);
	}
	else
	{
		SMA_5.push(_.last(SMA_5) + SMA_optimize(dp20,5));
		SMA_20.push(_.last(SMA_20) +  SMA_optimize(dp20,20));
	}
}

function SMA_optimize(datapoints, n)
{
	return (_.last(datapoints) - datapoints[datapoints.length-n-1])/n;
}

//sum function for array x
function sum(x) {
	//code from Underscore.js Docmuentation
	return _.reduce(x, function(memo, num){return memo+num;},0);
}

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

var modes = [],
	bsprices = [];

bsclient.buy = function() {
	modes.push("B");
	bsclient.write('B\n');
}

bsclient.sell = function() {
	modes.push("S");
	bsclient.write('S\n');
}

bsclient.on('data', function(data) {
	bsprices.push(data);
});

bsclient.on('end', function() {
	var pricesfmt = [];
	_.map(bsprices, function(price) {
		try {
			pricesfmt.push(price.toFixed(3));
		} catch (err) {
			pricesfmt = pricesfmt.concat(price.toString().match(/\d+\.\d{3}/g));
		}
	});
	pricesfmt = _.compact(pricesfmt).length;
	console.log(modes.length);
	_.first(modes, pricesfmt.length);
});