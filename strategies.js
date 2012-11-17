//Have arrays of slow and fast, SMA, LWMA, EMA, TMA

//keep track of last datapoint

_ = require('underscore');

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
	var t = datapoints.length;
	if(t<= 5)
	{
		SMA_5.push(sum(datapoints)/t);
		SMA_20.push(_.last(SMA_5));
	}
	else if(t <= 20) 
	{
		temp_sum = sum(_.last(datapoints, 5));
		SMA_20.push((temp_sum + sum(_.first(datapoints,t-5)))/t);
		SMA_5.push(temp_sum/5);
	}
	else
	{
		SMA_5.push(_.last(SMA_5) += SMA_optimize(datapoints,5));
		SMA_20.push(_.last(SMA_20) +=  SMA_optimize(datapoints,20));
	}
}

function SMA_optimize(datapoints, n)
{
	return datapoints[datapoints.length-n-1] + _.last(datapoints)/n;
}

function LWMA(datapoints)
{	
	var t = datapoints.length;
	var factors = _.range(1,t+1);
	if(t<= 5)
	{
		LWMA_5 = sum(_.map(_.zip(datapoints,factors), function(array){return array[0]*array[1];}))/sum(factors);
		LWMA_20 = LWMA_5;	 
	}
	else if(t <= 20) 
	{  
		//optimize later
		LWMA_5 = LWMA_optimize(datapoints, 5);
		LWMA_20 = sum(_.map(_.zip(datapoints,factors), function(array){return array[0]*array[1];}))/sum(factors);
	}
	else
	{
		LWMA_5 = LWMA_optimize(datapoints, 5);
		LWMA_20 = LWMA_optimize(datapoints, 20);
	}
	return LWMA_5;
}

function LWMA_optimize(datapoints, n)
{
	var factors = _.range(1,n+1);
	return sum(_.map(_.zip(datapoints,factors), function(array){return array[0]*array[1];}))/sum(factors);
}

function factorial_LWMA_sum(data, factors)
{
	//
}

function EMA(datapoints)
{	
	var t = datapoints.length;
	if(t<= 5)
	{
	}
	else if(t <= 20) 
	{
	}
	else
	{
		//call EMA_optimize(datapoints);
		//OPTIMIZE THIS LATER for when t > 20
	}	
}

function EMA_optimize(datapoints)
{
	//
}

function TMA(datapoints)
{	
	var t = datapoints.length;
	if(t<= 5)
	{
	}
	else if(t <= 20) 
	{
	}
	else
	{
		//call TMA_optimize(datapoints);
		//OPTIMIZE THIS LATER for when t > 20
	}	
}

function TMA_optimize(datapoints)
{
	//
}

//sum function for array x
function sum(x)
{
	//code from Underscore.js Docmuentation
	return _.reduce(x, function(memo, num){return memo+num;},0);
}