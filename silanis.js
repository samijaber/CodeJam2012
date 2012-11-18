var post_data = require('querystring').stringify({
	team: "AJ has no class",
	destination : "carlpaten@gmail.com",

});

var req = require('http').request({
	host: 'https://stage-api.e-signlive.com',
	method: 'POST',
	path: '/aws/rest/services/codejam',
	headers: {
		'Authentication": "Basic Y29kZWphbTpBRkxpdGw0TEEyQWQx'
	}
})