var Strategies = require('./strategies').Strategies;
var _ = require('underscore');

var dp = [1,2,3,4,5,6,7,8,9,10];

for (var i = 0; i < dp.length; i++) {
	Strategies.populate(_.first(dp,i+1));
};

console.log(Strategies.SMA.slow);
console.log(Strategies.SMA.fast);

console.log(Strategies.LWMA.slow);
console.log(Strategies.LWMA.fast);

console.log(Strategies.EMA.slow);
console.log(Strategies.EMA.fast);

console.log(Strategies.TMA.slow);
console.log(Strategies.TMA.fast);