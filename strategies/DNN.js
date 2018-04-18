var log = require('../core/log');
var netlinkwrapper = require("netlinkwrapper");
var strat = {};

strat.init = function() {
  this.input = 'candle';
  this.requiredHistory = this.tradingAdvisor.historySize;
  this.counter = 0;
  this.ubound = this.settings.thresholds.up;
  this.lbound = this.settings.thresholds.down;
  this.score = 0.0;
  this.trend = {
    direction: 'none'
    //duration: 0,
    //persisted: false,
    //adviced: false
  };
  this.netlink = new netlinkwrapper();

  // connect to backend
  this.netlink.connect(9999, "localhost");
  this.netlink.blocking(true);

  // send history size
  var data = {history: this.requiredHistory};
  log.debug('dnn init: sending history and setting');
  log.debug('dnn init: history = ' + this.requiredHistory);
  this.netlink.write(JSON.stringify(data));

  // read response
  var str = this.netlink.read(1024);
  var res = JSON.parse(str);
  //log.debug('dnn init: result = ' + res.result);
}

strat.update = function(candle) {
  // send candle data
  var data = {counter: this.counter++,
              close: candle.close,
              high: candle.high,
              low: candle.low,
              volume: candle.volume,
              trades: candle.trades};
  var msg = JSON.stringify(data);
  this.netlink.write(msg);

  // get score
  var str = this.netlink.read(1024);
  var res = JSON.parse(str);
  this.score = res.prediction;
}

strat.log = function() {
  //log.debug('dnn log: ' + this.score.toString());
}

strat.check = function() {
  log.debug('dnn check: ' + this.score.toString());
}

module.exports = strat;
