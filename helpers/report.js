var schedule = require('./schedule');

function formatTransactionInfo(modes, prices, times, strategies) {
  var transactions = _.zip(modes, prices, times, strategies);
  return _.map(transactions, formatTransaction);
}

function formatTransaction(data) {
  json = {
    type: data[0],
    price: data[1],
    time: data[2],
    strategy: data[3],
    manager: schedule.getManager( data[2], data[3] )
  }
  return json;
}

exports.formatTransactionInfo = formatTransactionInfo;