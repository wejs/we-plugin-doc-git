var fs = require('fs');
var markdown = require('marked');
var git    = require('gitty');

var doc = {};

doc.projects = {};

doc.loadProjectDocs = function loadProjectDocs(we, project) {
  var folder = we.config.doc.folder + '/' + project.name;

  we.doc.projects[project.name] = require(folder +'/wejsdoc.json');
  we.doc.projects[project.name].configs = project;
  we.doc.projects[project.name].folder = folder;
  we.doc.projects[project.name].projectName = project.name;
  we.doc.projects[project.name].docsFolder =
    folder + '/' + we.doc.projects[project.name].rootFolder;

  we.doc.projects[project.name].menu = doc.generateMenu(we.doc.projects[project.name]);
}

doc.generateMenu = function generateMenu(projectConfig) {
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