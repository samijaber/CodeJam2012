var fs = require('fs');
var sys = require('sys');

exports.index = function(response) {
  console.log("Index action called!");
  
  fs.readFile('./client/index.html', function (err, data) {
    console.log(data);
      response.writeHead(200, { 'Content-type': 'text/html', 'Content-Length': data.length });
      response.write(data);
      response.end();
  });
}