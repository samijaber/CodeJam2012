"use strict";

var _ = require('underscore');
var net = require('net');

var pricefeed = [];
var time = 0;

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
		_.last(SMA_5), 
		_.last(SMA_20), 
		bsclient.buy,
		bsclient.sell
	);


});

pfclient.on('end', function() {
	console.log('pfclient disconnected');
});

function Strategy(f) {
	this.populate = f;
}

Strategy.prototype = {
	fast: [],
	slow: []
}

var SMA_5 = [], 
	SMA_20 = [], 
	LWMA_5 = [],
	LWMA_20= [], 
	EMA_5= [],
	EMA_20= [], 
	TMA_5= [], 
	TMA_20 = [];

//SMA function
function SMA(datapoints)
{
	var temp_sum;
	var t = datapoints.length;
	if(t<= 5)
	{
		SMA_5.push(		Math.round( (sum(datapoints)/t) * 1000) / 1000 );
		SMA_20.push(_.last(SMA_5));
	}
	else if(t <= 20) 
	{
		temp_sum = sum(_.last(datapoints, 5));
		SMA_20.push( 	Math.round( ( (temp_sum + sum(_.first(datapoints,t-5))) /t) *1000 ) /1000 );
		SMA_5.push( 	Math.round( (temp_sum/5) *1000 )/1000 );
	}
	else
	{
		SMA_5.push(_.last(SMA_5) + SMA_optimize(datapoints,5));
		SMA_20.push(_.last(SMA_20) +  SMA_optimize(datapoints,20));
	}
}

function SMA_optimize(datapoints, n)
{
	return Math.round( (_.last(datapoints)/n - datapoints[datapoints.length-n-1]/n) * 1000) /1000;
}

function LWMA(datapoints)
{	
	var t = datapoints.length;
	if(t<= 5)
	{
		LWMA_5.push(LWMA_optimize(datapoints, t));
		LWMA_20.push(_.last(LWMA_5));	 
	}
	else if(t <= 20) 
	{  
		LWMA_5.push(LWMA_optimize(datapoints, 5));
		LWMA_20.push(LWMA_optimize(datapoints, t));
	}
	else
	{
		LWMA_5 = LWMA_optimize(datapoints, 5);
		LWMA_20 = LWMA_optimize(datapoints, 20);
	}
}

function LWMA_optimize(datapoints, n)
{
	var factors = _.range(1,n+1);
	var datapoints = _.last(datapoints, n);
	return Math.round( sum(_.map(_.zip(datapoints,factors), function(array){return array[0]*array[1];}))/sum(factors) *1000) /1000;
}

function EMA(datapoints)
{	
	var t = datapoints.length;
	var lastprice = _.last(datapoints);

	if(t == 1)
	{
		EMA_5.push(lastprice);
		EMA_20.push(lastprice);
	}
	else
	{
		var prev_EMA_5 = _.last(EMA_5);
		var prev_EMA_20 = _.last(EMA_20);
		EMA_5.push(EMA_optimize(lastprice, 5, prev_EMA_5));
		EMA_20.push(EMA_optimize(lastprice, 20, prev_EMA_20));
	}
}

function EMA_optimize(lastp, n, prev)
{
	var value = prev + ((lastp - prev) * (2/(n+1)));
	return Math.round(value*1000) /1000;
}


function TMA(datapoints)
{	
	var t = datapoints.length;
	if(t<= 5)
	{
		TMA_5.push(TMA_optimize(_.last(SMA_5,t),t));
		TMA_20.push(TMA_optimize(_.last(SMA_20,t),t));
	}
	else if(t <= 20) 
	{
		TMA_5.push(TMA_optimize(_.last(SMA_5,5),5));
		TMA_20.push(TMA_optimize(_.last(SMA_20,t),t));
	}
	else
	{
		TMA_5.push(TMA_optimize(_.last(SMA_5,5),5));
		TMA_20.push(TMA_optimize(_.last(SMA_20,20),20));
	}	
}

function TMA_optimize(data, n)
{
	return Math.round( ( (sum(data)/n) *1000 )) / 1000;
}

//sum function for array x
function sum(x)
{
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

var bsmodes = [],
	bsprices = [],
	bstimes = [];

bsclient.buy = function() {
	bsmodes.push("B");
	bsclient.write('B\n');
}

bsclient.sell = function() {
	bsmodes.push("S");
	bsclient.write('S\n');
}

bsclient.on('data', function(data) {
	bsprices.push(data);
	bstimes = []; //not exact, possibly a few seconds too high
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
	console.log(bsmodes.length);
	_.first(bsmodes, pricesfmt.length);
});