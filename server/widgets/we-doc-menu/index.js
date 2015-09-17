module.exports = function weDocMenuWidget(projectPath, Widget) {
  var widget = new Widget('we-doc-menu', __dirname);

  widget.afterSave = function afterSave(req, res, next) {
    if (!req.body.configuration) req.body.configuration = {};
    req.body.configuration.projectName = req.body.projectName;
    return next();
  };

  widget.formMiddleware = function formMiddleware(req, res, next) {
    var we = req.getWe();
    if (!we.config.doc || !we.config.doc.projects) {
      res.locals.projects = {};
    } else {
      res.locals.projects = we.config.doc.projects;
    }

    next();
  }

  widget.viewMiddleware = function viewMiddleware(widget, req, res, next) {
    var we = req.getWe();

    if (
      widget.configuration &&
      widget.configuration.projectName &&
      we.doc.projects[widget.configuration.projectName]
    ) {
      widget.menu = we.doc.projects[widget.configuration.projectName].JSONmenu;
    }

    return next();
  }

  return widget;
};