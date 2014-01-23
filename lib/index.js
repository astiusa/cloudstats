var Hoek  = require('hoek'),
    Stats = require('./stats');

var internals = {};

internals.defaults = {
  namespace: 'hapi-server',
  frequency : 60000
};

internals.trackStats = function (plugin, cloudwatch, namespace, stats) {
  var params  = {
    Namespace : namespace,
    MetricData : []
  };

  params.MetricData.push({
    MetricName : 'RequestCount',
    Unit       : 'Count',
    Timestamp  : new Date().toISOString(8601),
    Value      : stats.totalRequests
  });

  params.MetricData.push({
    MetricName : 'HTTPCode_2XX',
    Unit       : 'Count',
    Timestamp  : new Date().toISOString(8601),
    Value      : stats.responses['2xx']
  });

  params.MetricData.push({
    MetricName : 'HTTPCode_3XX',
    Unit       : 'Count',
    Timestamp  : new Date().toISOString(8601),
    Value      : stats.responses['3xx']
  });

  params.MetricData.push({
    MetricName : 'HTTPCode_4XX',
    Unit       : 'Count',
    Timestamp  : new Date().toISOString(8601),
    Value      : stats.responses['4xx']
  });

  params.MetricData.push({
    MetricName : 'HTTPCode_5XX',
    Unit       : 'Count',
    Timestamp  : new Date().toISOString(8601),
    Value      : stats.responses['5xx']
  });

  if(stats.latencies && stats.latencies.length > 0) {
    params.MetricData.push({
      MetricName  : 'Latency',
      Unit        : 'Milliseconds',
      StatisticValues  : {
        Minimum : stats.minLatency(),
        Maximum : stats.maxLatency(),
        Sum : stats.totalLatency(),
        SampleCount : stats.latencies.length
      }
   });
  }

  var metricData = Hoek.clone(params);
  stats.reset();

  cloudwatch.putMetricData(metricData, function (err) {
    if(err) {
      plugin.log(['plugin', 'error'], 'failed to push cloudwatch metrics');
    }
  });

};

exports.register = function (plugin, options, next) {
  var settings = Hoek.applyToDefaults(internals.defaults, options || {});

  if(!settings.AWS) {
    return next(new Error('AWS sdk module is required'));
  }

  var cloudwatch = new settings.AWS.CloudWatch();

  var stats = new Stats(plugin);

  setInterval(function () {
    internals.trackStats(plugin, cloudwatch, settings.namespace, stats);
  }, settings.frequency);

  return next();
};
