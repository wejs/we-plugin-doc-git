var fs = require('fs');
var markdown = require('marked');
var git    = require('gitty');
var exec = require('child_process').exec;

var doc = {};

doc.projects = {};

doc.initialize = function initialize(we, done) {
  we.doc = doc;

  we.utils.mkdirp (we.config.doc.folder, function (err) {
    if (err) we.log.error('Error on create project docs file', err);
    if (!we.config.doc.projects) return done();

    we.utils.async.each(we.config.doc.projects, function (project, next) {
      fs.stat(we.config.doc.folder + '/' + project.name, function (err) {
        if (err) {
          if (err.code == 'ENOENT') {
            if (!we.config.doc.cloneInBootstrap) return next();

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

          return next(err);
        }

        if (!we.config.doc.pullInBootstrap) return next();

        we.log.info('Updating ', + project.name, ' from ' + we.config.doc.folder + ' ... wait ...');
        console.time('wejsdoc pull time for ' + project.name);

        var repo = git(we.config.doc.folder + '/' + project.name);

        repo.pull('origin', 'master', function (err) {
          if (err) throw err;
          we.log.info('git update done form ' + project.name, ' from ' + we.config.doc.folder );
          console.timeEnd('wejsdoc pull time for ' + project.name);
          next();
        });

      });
    }, function(err) {
      if (err) throw err;
      we.config.doc.projects.forEach(function (project) {
        doc.loadProjectDocs(we, project);
      });

      done();
    });
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
  we.doc.projects[project.name].JSONmenu = doc.generateJSONMenu(we.doc.projects[project.name]);
}

doc.generateJSONMenu = function generateJSONMenu(projectConfig) {
  var baseUrl = '/docs/' + projectConfig.projectName;
  var menu = {
    projectName: projectConfig.projectName,
    links: [{
      title: projectConfig.title,
      model: 'wejsdoc',
      modelId: projectConfig.projectName,
      url: baseUrl
    }]
  };

  for (var i in projectConfig.pages) {
    doc.generateJSONMenuItem(i, projectConfig.pages[i] , null, baseUrl, menu);
  }
  return menu;
}

doc.generateJSONMenuItem = function generateJSONMenuItem(pageName, page, basePageName, baseUrl, menu) {
  menu.links.push({
    title: page.title,
    model: 'wejsdoc',
    modelId: pageName,
    url: baseUrl + '/' + pageName
  });

  if (page.pages) {
    for (var i in page.pages) {
      doc.generateJSONMenuItem(pageName + '.' + i ,page.pages[i] , basePageName, baseUrl, menu);
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