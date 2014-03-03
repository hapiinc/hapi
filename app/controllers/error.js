module.exports.server = exports.server = function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', { title: 'Hapi', user: req.isAuthenticated() });
};
module.exports.client = exports.client = function (req, res, next) {
    res.status(404);
    res.render('404', { title: 'Hapi', user: req.isAuthenticated() });
};
