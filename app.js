var server = require('./client/server')
  , router = require('./client/router')
  , actions = require('./client/actions');
  
var handle = {};

handle['/'] = actions.index;
handle['/data/'] = actions.data;

server.start(router.route, handle);
