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
      widgetContext: 'wejsdoc',
      responseType  : 'json'
    },
    'get /docs/:project': {
      name          : 'wejsdoc.findOne',
      controller    : 'wejsdoc',
      action        : 'findOne',
      widgetContext: 'wejsdoc',
      permission    : true
    },
    'get /docs/:project/:page': {
      name          : 'wejsdoc.findOnePage',
      controller    : 'wejsdoc',
      action        : 'findOne',
      widgetContext: 'wejsdoc',
      permission    : true
    }
  });

  plugin.setTemplates({
    'wejsdoc/findOne': __dirname + '/server/templates/wejsdoc/findOne.hbs'
  });

  plugin.setWidgets({
    'we-doc-menu': __dirname + '/server/widgets/we-doc-menu'
  });

  plugin.hooks.on('we:create:default:folders', function(we, done) {
    wejsdoc.initialize(we, done);
  });

  return plugin;
};