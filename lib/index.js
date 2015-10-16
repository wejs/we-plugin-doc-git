var fs = require('fs');
var markdown = require('marked');
var exec = require('child_process').exec;

var doc = {};
doc.projects = {};

doc.initialize = function initialize(we, done) {
  we.doc = doc;

  we.utils.mkdirp (we.config.doc.folder, function (err) {
    if (err) we.log.error('Error on create project docs file', err);
    if (!we.config.doc.projects) return done();

    we.utils.async.each(
      we.config.doc.projects,
      doc.load.bind({ we: we, isBootstrap: true }),
    function (err) {
      if (err) throw err;
      we.config.doc.projects.forEach(function (project) {
        doc.loadProjectDocs(we, project);
        doc.setNextAndPrevius(we, project);
      });
      done();
    });
  });
}

doc.load = function load(project, next) {
  var we = this.we;
  var isBootstrap = this.isBootstrap;

  fs.stat(we.config.doc.folder + '/' + project.name, function (err) {
    if (err) {
      if (err.code == 'ENOENT') {
        return doc.clone.bind({
          we:we, isBootstrap: isBootstrap
        })(project, next);
      }
      return next(err);
    }

    if (isBootstrap && !we.config.doc.pullInBootstrap)
      return next();

    we.log.info('Updating ' + project.name + ' from ' + we.config.doc.folder + ' ... wait ...');
    console.time('wejsdoc pull time for ' + project.name);

    return exec('cd '+ we.config.doc.folder + '/' + project.name + ' && git pull ',
    function (error) {
      if (error) return next(error);

      we.log.info('git update done form ' + project.name, ' from ' + we.config.doc.folder );
      console.timeEnd('wejsdoc pull time for ' + project.name);
      next();
    });
  });
}

doc.clone = function clone(project, next) {
  var we = this.we;
  var isBootstrap = this.isBootstrap;

  if (isBootstrap && !we.config.doc.cloneInBootstrap)
    return next();

  we.log.info('Cloning ' + project.name + ' from ' + we.config.doc.folder + ' , wait ...');
  console.time('Clone time for ' + project.name);

  return exec('cd '+ we.config.doc.folder +' && git clone ' + project.gitRemote + ' ' + project.name,
  function (error) {
    if (error) return next(error);
    we.log.info('we-plugin-doc-git: Project cloned:', project.name);
    console.timeEnd('Clone time for ' + project.name);
    next();
  });
}

doc.loadProjectDocs = function loadProjectDocs(we, project) {
  var folder = we.config.doc.folder + '/' + project.name;

  try {
    we.doc.projects[project.name] = require(folder +'/wejsdoc.json');
  } catch (e) {
     if (e.code == 'MODULE_NOT_FOUND') {
       we.log.error('Project doc configuration file wejsdoc.json not found in: ', folder);
       process.exit();
     } else {
       throw e;
     }
  }

  we.doc.projects[project.name].configs = project;
  we.doc.projects[project.name].folder = folder;
  we.doc.projects[project.name].projectName = project.name;
  we.doc.projects[project.name].docsFolder =
    folder + '/' + we.doc.projects[project.name].rootFolder;

  we.doc.projects[project.name].menu = doc.generateHTMLMenu(we.doc.projects[project.name]);
  we.doc.projects[project.name].JSONmenu = doc.generateJSONMenu(we, we.doc.projects[project.name]);
}

doc.setNextAndPrevius = function(we, project){
  var pages = we.doc.projects[project.name].pages;
  var rootPagesNames = Object.keys(pages);
  var subpagesNames, subpages;

  for (var i = 0; i < rootPagesNames.length; i++) {
    pages[rootPagesNames[i]].slugName = rootPagesNames[i];

    // set previus in root page
    if (subpages) {
      pages[rootPagesNames[i]].previus = subpages[subpagesNames[subpagesNames.length-1]];
    } else if (rootPagesNames[i-1]) {
      pages[rootPagesNames[i]].previus = pages[rootPagesNames[i-1]];
    }

    subpages = pages[rootPagesNames[i]].pages;
    if (subpages) {
      subpagesNames = Object.keys(subpages);
      // set next in root page
      if (subpagesNames[0]) pages[rootPagesNames[i]].next = subpages[subpagesNames[0]];

      for (var j = 0; j < subpagesNames.length; j++) {
        // set url slug
        subpages[subpagesNames[j]].slugName = rootPagesNames[i]+'.'+subpagesNames[j];

        // set previus in sub page
        if (subpagesNames[j-1]) {
          subpages[subpagesNames[j]].previus = subpages[subpagesNames[j-1]];
        } else {
          // set parent if dont have subpage before
          subpages[subpagesNames[j]].previus = pages[rootPagesNames[i]];
        }
        // set next in root page
        if (subpagesNames[j+1]) {
          subpages[subpagesNames[j]].next = subpages[subpagesNames[j+1]];
        } else {
          // set next parent if dont have subpage after
          subpages[subpagesNames[j]].next = pages[rootPagesNames[i+1]];
        }
      }
    } else {
      // set next in root page
      if (rootPagesNames[i+1]) pages[rootPagesNames[i]].next = pages[rootPagesNames[i+1]];
    }
  }
}

/**
 * Generate wejsdoc menu
 *
 * @param  {Object} we            we.js objct
 * @param  {Object} projectConfig
 * @return {Object}               instance of we.class.Menu
 */
doc.generateJSONMenu = function generateJSONMenu(we, projectConfig) {
  var baseUrl = '/docs/' + projectConfig.projectName;
  var menu = {
    projectName: projectConfig.projectName,
    class: 'nav nav-pills nav-stacked',
    submenuTemplate: 'menu/submenu',
    links: []
  };
  var n = 1;
  for (var i in projectConfig.pages) {
    doc.generateJSONMenuItem(i, projectConfig.pages[i] , null, baseUrl, menu, null, n);
    n++;
  }

  return new we.class.Menu(menu);
}

doc.generateJSONMenuItem = function generateJSONMenuItem(pageName, page, basePageName, baseUrl, menu, parent, weight) {
  menu.links.push({
    id: 'wejsdoc.'+pageName,
    text: page.title,
    href: baseUrl + '/' + pageName,
    weight: weight,
    parent: parent
  });

  if (page.pages) {
    var n2 = 0;
    for (var i in page.pages) {
      doc.generateJSONMenuItem(
        pageName + '.' + i ,
        page.pages[i] , basePageName,
        baseUrl,
        menu,
        'wejsdoc.'+pageName, n2
      );
    }
  }
}

doc.generateHTMLMenu = function generateHTMLMenu(projectConfig) {
  var baseUrl = '/docs/' + projectConfig.projectName;
  var menu = '<ul class="nav nav-pills nav-stacked project-'+ projectConfig.projectName +'">'+
    '<li>'+
      '<a data-dlink="true" data-model-name="wejsdoc" data-model-id="'+ projectConfig.projectName
         +'" href="'+ baseUrl +'">' + projectConfig.title + '</a>'+
    '</li>';

    for (var i in projectConfig.pages) {
      menu += doc.generateMenuItem(i, projectConfig.pages[i] , null, baseUrl);
    }

  menu += '</ul>';
  return menu;
}

doc.generateMenuItem = function generateMenuItem(pageName, page, basePageName, baseUrl) {
  var menuItem = '<li>'+
      '<a data-dlink="true" data-model-name="wejsdoc.dpage" data-model-id="'+ pageName
        +'" href="'+ baseUrl + '/' + pageName +'">' + page.title + '</a>'+
    '</li>';

    if (page.pages) {
      for (var i in page.pages) {
        menuItem += doc.generateMenuItem(pageName + '.' + i ,page.pages[i] , basePageName, baseUrl);
      }
    }
  return menuItem;
}

doc.getPageConfig = function getPageConfig(project, page) {
  if (!page) return doc.projects[project];

  var names = page.split('.');
  var pageObj = doc.projects[project];

  for (var i=0; i < names.length; i++) {
    if (!pageObj.pages || !pageObj.pages[names[i]]) return null;
    pageObj = pageObj.pages[names[i]];
  }

  return pageObj;
}

doc.getFilePath = function getFilePath(project, pageConfig) {
  if (!pageConfig || !pageConfig.file) return  doc.projects[project].docsFolder + '/README.md';
  return doc.projects[project].docsFolder + '/' + pageConfig.file;
}

doc.getHTMLDoc = function getHTMLDoc(project, pageConfig, cb) {
  var filePath = doc.getFilePath(project, pageConfig);

  if (!filePath) return cb();

  fs.readFile(filePath, 'utf8', function (err, contents) {
    if (err) {
      if (err.code == 'ENOENT') {
        return cb();
      } else {
        return cb(err);
      }
    }
    cb(null, markdown(contents));
  });
}

// TODO
// doc.cloneRepo = function cloneRepo(projectName) {

// }

// doc.updateRepo = function updateRepo(projectName) {

// }

module.exports = doc;