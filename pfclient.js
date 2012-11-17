"use strict";

var _ = require('underscore');

var prices = [];
var exchangeOpen = false;

var pfclient = require('net').connect({port: 8000},
    function() { //'connect' listener
  console.log('pfclient connected');
  exchangeOpen = true;
  pfclient.write('H\n');
});

pfclient.on('data', function(data) {

	var arr = data
		.toString()
		.split("|");

	if(arr.pop() == "C") { //Empty string, except when it's C, then it means the exchange closed
		pfclient.end();
	}

	arr = arr
		.map(function(a) {return parseFloat(a);})
	;

	_.map(arr, function(val) {
		prices.push(val);
		SMA(_.last(prices, 20));
	});
});

pfclient.on('end', function() {
	exchangeOpen = false;
	console.log('client disconnected');
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
	return _.last(datapoints)/n - datapoints[datapoints.length-n-1];
}

//sum function for array x
function sum(x) {
	//code from Underscore.js Docmuentation
	return _.reduce(x, function(memo, num){return memo+num;},0);
}