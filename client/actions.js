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

var PRICE = [99.140, 99.210, 92.300, 99.340, 94.390, 99.270, 99.340, 96.510, 99.490, 99.480, 99.540, 99.600],
    SMA_5 = [99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340],
    SMA_20 = [99.510, 99.490, 99.480, 99.540, 99.340, 99.390, 99.270, 99.340, 99.480, 99.540, 99.480, 99.540],
    LWMA_5 = [99.510, 99.490, 99.480, 99.540, 99.340, 99.390, 99.270, 99.340, 99.480, 99.540, 99.480, 99.540],
    LWMA_20 = [99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340],
    EMA_5 = [99.510, 99.490, 99.480, 99.540, 99.340, 99.390, 99.270, 99.340, 99.480, 99.540, 99.480, 99.540],
    EMA_20 = [99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340],
    TMA_5 = [99.510, 99.490, 99.480, 99.540, 99.340, 99.390, 99.270, 99.340, 99.480, 99.540, 99.480, 99.540],
    TMA_20 = [99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340, 99.340, 99.390, 99.270, 99.340];

exports.data = function(response) {
  var data = {
    'prices': PRICE,
      'sma' : {
        'fast': SMA_5,
        'slow': SMA_20
      },
      'lwma': {
        'fast': LWMA_5,
        'slow': LWMA_20
      },
      'ema': {
        'fast': EMA_5,
        'slow': EMA_20
      },
      'tma': {
        'fast': TMA_5,
        'slow': TMA_20
      }
  }

  response.writeHead(200, { 'Content-type': 'text/plain'});
  response.write( JSON.stringify(data) );
  response.end();
}
