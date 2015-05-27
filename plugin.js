/**
 * We.js we-plugin-doc-git plugin settings
 */
var mkdirp = require('mkdirp');
var wejsdoc = require('./lib');

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    doc: {
      folder: projectPath + '/files/wejsdoc',
      projects: [] // set project names in you local.js settings
    }
  });
  // ser plugin routes
  plugin.setRoutes({
    'get /docs/:project': {
      name          : 'wejsdoc.findOne',
      controller    : 'wejsdoc',
      action        : 'findOne',
      permission    : true
    },
    'get /docs/:project/:page': {
      name          : 'wejsdoc.findOne',
      controller    : 'wejsdoc',
      action        : 'findOne',
      permission    : true
    }
  });

  plugin.hooks.on('we:create:default:folders', function(we, done) {
    // create image upload path
    mkdirp (we.config.doc.folder, function (err) {
      if (err) we.log.error('Error on create project docs file', err);
      done();
    });
  });

  plugin.events.on('we:bootstrap:done', function(we) {
    we.doc = wejsdoc;
    we.config.doc.projects.forEach(function (project) {
      wejsdoc.loadProjectDocs(we, project);
    });
  });

  return plugin;
};