
module.exports = {
  findOne: function(req, res, next) {
    var we = req.getWe();

    if (!we.doc.projects[req.params.project]) return next();

    var pageConfig = we.doc.getPageConfig(req.params.project, req.params.page);
    if (!pageConfig) return res.notFound();

    we.doc.getHTMLDoc(req.params.project, pageConfig, function (err, html) {
      if (err) return res.serverError(err);
      if (!html) return res.notFound();

      res.locals.pageConfig = pageConfig;

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
  },

  adminPage: function(req, res) {
    res.locals.projects = req.we.doc.projects;
    res.ok();
  },

  reload: function(req, res) {
    if (!req.we.doc.projects[req.params.project])
      return res.notFound();

    var cfg = req.we.doc.projects[req.params.project].configs;

    req.we.doc
    .load.bind({ we: req.we })(cfg, function(err) {
      if (err) return res.serverError(err);

      req.we.doc.loadProjectDocs(req.we, cfg);
      req.we.doc.setNextAndPrevius(req.we, cfg);

      if (res.locals.redirectTo) {
        res.goTo(res.locals.redirectTo);
      } else {
        res.ok();
      }
    });
  }
};