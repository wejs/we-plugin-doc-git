/**
 * We.js we-plugin-doc-git plugin settings
 */

var wejsdoc = require('./lib');

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    doc: {
      cloneInBootstrap: true,
      pullInBootstrap: true,
      folder: projectPath + '/files/wejsdoc',
      projects: [] // set project names in you local.js settings
    }
  });
  // ser plugin routes
  plugin.setRoutes({
    'get /api/v1/docs/:project/menu': {
      name          : 'wejsdoc.getDocMenu',
      controller    : 'wejsdoc',
      action        : 'getDocMenu',
      permission    : true,
      responseType  : 'json'
    },
    'get /docs/:project': {
      name          : 'wejsdoc.findOne',
      controller    : 'wejsdoc',
      action        : 'findOne',
      permission    : true
    },
    'get /docs/:project/:page': {
      name          : 'wejsdoc.findOnePage',
      controller    : 'wejsdoc',
      action        : 'findOne',
      permission    : true
    }
  });

  plugin.hooks.on('we:create:default:folders', function(we, done) {
    wejsdoc.initialize(we, done);
  });

  return plugin;
};