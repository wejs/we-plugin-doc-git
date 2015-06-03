
module.exports = {
  findOne: function(req, res, next) {
    var we = req.getWe();

    if (!we.doc.projects[req.params.project]) return next();

    var pageConfig = we.doc.getPageConfig(req.params.project, req.params.page);
    if (!pageConfig) return res.notFound();

    we.doc.getHTMLDoc(req.params.project, pageConfig, function (err, html) {
      if (err) return res.serverError(err);
      if (!html) return res.notFound();

      if (res.locals.responseType === 'json')
        return res.send({
          title: pageConfig.title,
          projectName: req.params.project,
          html: html
        });

      res.locals.title = pageConfig.title;
      res.locals.projectName = req.params.project;
      res.locals.html = html;

      res.locals.menu = we.doc.projects[req.params.project].menu;

      res.set('Content-Type', 'text/html');
      res.locals.template = 'wejsdoc/findOne';
      res.view();
    });
  },

  getDocMenu: function getDocMenu(req, res) {
    var we = req.getWe();

    if (!we.doc.projects[req.params.project]) return res.notFound();

    res.status(200).send({
      menu: we.doc.projects[req.params.project].JSONmenu
    })
  }
};