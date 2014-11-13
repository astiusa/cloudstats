'use strict';

var Stats = module.exports = function(plugin) {
  this.plugin = plugin;
  this._initCounters();

  var self = this;

  plugin.events.on('request', function (request, event) {
    plugin.log(['log'], 'cloudwatch request');
    if(~event.tags.indexOf('received')) {
      self.trackRequest();
    }
  });

  plugin.events.on('response', function (request, event) {

    var res = request.raw.res;

    var latency = Date.now() - request.info.received;
    plugin.log(['log'], 'cloudwatch response ' + latency);
    self.trackLatency(latency)

    self.trackResponseCode(res.statusCode);
  });
};

Stats.prototype._initCounters = function () {
  this.timeouts = 0;
  this.responses = {
    '2xx' : 0,
    '3xx' : 0,
    '4xx' : 0,
    '5xx' : 0
  };
  this.totalRequests = 0;
  this.latencies = [];
};

Stats.prototype.totalLatency = function () {
  return this.latencies.reduce(function(previousValue, currentValue){
    return previousValue + currentValue;
  }, 0);
};

Stats.prototype.trackResponseCode = function (code) {
  if(code < 300) {
    this.responses['2xx']++;
  } else if (code >= 300 && code < 400) {
    this.responses['3xx']++;
  } else if (code >= 400 && code < 500) {
    this.responses['4xx']++;
  } else {
    this.responses['5xx']++;
  }
};

Stats.prototype.trackRequest = function () {
  this.totalRequests++;
};

Stats.prototype.trackLatency = function (latency) {
  this.latencies.push(latency);
};

Stats.prototype.minLatency = function () {
  return Math.min.apply(Math, this.latencies);
};

Stats.prototype.maxLatency = function () {
  return Math.max.apply(Math, this.latencies);
};

Stats.prototype.averageLatency = function () {
  if(this.latencies.length === 0) {
    return 0;
  }

  return this.totalLatency() / this.latencies.length;
};

Stats.prototype.reset = function () {
  this._initCounters();
};
