/**
 * We.js we-plugin-doc-git plugin settings
 */

const wejsdoc = require('./lib');

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    permissions: {
      'admin_wejsdoc': {
        'title': 'Admin documentation projects',
        'description': 'Update documentation projects'
      }
    },
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
      layoutName    : 'wejsdoc',
      widgetContext: 'wejsdoc',
      responseType  : 'json'
    },
    'get /docs/:project': {
      name          : 'wejsdoc.findOne',
      controller    : 'wejsdoc',
      action        : 'findOne',
      layoutName    : 'wejsdoc',
      widgetContext: 'wejsdoc',
      permission    : true
    },
    'get /docs/:project/:page': {
      name          : 'wejsdoc.findOnePage',
      controller    : 'wejsdoc',
      action        : 'findOne',
      layoutName    : 'wejsdoc',
      widgetContext: 'wejsdoc',
      permission    : true
    },

    'get /admin/git-doc': {
      titleHandler  : 'i18n',
      titleI18n     : 'wejsdoc.find',
      name          : 'admin.wejsdoc',
      controller    : 'wejsdoc',
      action        : 'adminPage',
      template      : 'wejsdoc/adminPage',
      permission    : 'admin_wejsdoc'
    },
    'post /admin/git-doc/:project/reload': {
      controller    : 'wejsdoc',
      action        : 'reload',
      template      : 'wejsdoc/adminPage',
      permission    : 'admin_wejsdoc',
      responseType  : 'json'
    }
  });

  plugin.hooks.on('we:create:default:folders', (we, done)=> {
    wejsdoc.initialize(we, done);
  });

  plugin.hooks.on('we-plugin-menu:after:set:core:menus', (data, done)=> {
    const we = data.req.we;
    // set admin menu
    if (data.res.locals.isAdmin) {
      data.res.locals.adminMenu.addLink({
        id: 'admin.wejsdoc',
        text: '<i class="fa fa-tags"></i> '+
          data.req.__('wejsdoc.find'),
        href: we.router.urlTo( 'admin.wejsdoc', [], we),
        weight: 12
      });
    }
    done();
  });

  return plugin;
};