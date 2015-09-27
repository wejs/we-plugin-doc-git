module.exports = function weDocMenuWidget(projectPath, Widget) {
  var widget = new Widget('we-doc-menu', __dirname);

  widget.afterSave = function afterSave(req, res, next) {
    if (!req.body.configuration) req.body.configuration = {};
    req.body.configuration.projectName = req.body.projectName;
    return next();
  };

  widget.formMiddleware = function formMiddleware(req, res, next) {
    if (!req.we.config.doc || !req.we.config.doc.projects) {
      res.locals.projects = {};
    } else {
      res.locals.projects = req.we.config.doc.projects;
    }
    next();
  }

  widget.viewMiddleware = function viewMiddleware(widget, req, res, next) {
    if (
      widget.configuration &&
      widget.configuration.projectName &&
      req.we.doc.projects[widget.configuration.projectName]
    ) {
      widget.menu = req.we.doc.projects[widget.configuration.projectName].JSONmenu;
    }
    return next();
  }

  return widget;
};