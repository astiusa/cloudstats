var Stats = require('./stats');

var internals = {};

internals.defaults = {
  namespace: 'hapi',
};

exports.register = function (plugin, options, next) {
  var settings = plugin.hapi.utils.applyToDefaults(internals.defaults, options || {});

  var stats = new Stats(plugin);

  setInterval(function () {
    console.log(stats);
  }, 20000);

  return next();
};
