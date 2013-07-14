var internals = {};

internals.defaults = {
    namespace: 'hapi',
};

exports.register = function (plugin, options, next) {
  var settings = plugin.hapi.utils.applyToDefaults(internals.defaults, options || {});

  console.log(settings);

  plugin.events.on('request', function (request, event, tags) {
    console.log(event, tags);
  });

  return next();
};
