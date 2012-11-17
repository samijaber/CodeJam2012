_ = require('underscore');

var fastAboveSlow; //Initialize to the right value!

function xOver(fast, slow, buy, sell) {
	if(fast.length != slow.length) {
		throw "length of the fast and slow datasets are different";
	}

	if(typeof fastAboveSlow === 'undefined') {
		fastAboveSlow = fast[0] > slow[0];
	}

	_.map(_.zip(fast, slow), function(arr) {
		if(fastAboveSlow != arr[0] > arr[1]) {
			fastAboveSlow = !fastAboveSlow;
			if(fastAboveSlow) { //If fast just overtook slow
				buy();
			} else {
				sell();
			}
		}
	});
}