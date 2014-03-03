module.exports.get = exports.get = function (req, res) {
    res.render('entry', { title: 'Hapi', user: req.isAuthenticated() });
};
