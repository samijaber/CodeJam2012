var http = require('http')
  , url = require('url');

function start(route, handle) {

  function on_request(request, response) {
    var pathname = url.parse(request.url).pathname;
    
    request.setEncoding("utf8");

    request.addListener("end", function() {
      route(handle, pathname, response);
    });    
 
  }
  
  http.createServer(on_request).listen(8888);
  console.log('Client server started');

}

exports.start = start;