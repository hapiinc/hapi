module.exports.controller = function (app) {
    app
        .get('/', function (req, res, next) {
            res.render('entry.html', {
                layout: false,
                title: 'Hapi',
                user: req.isAuthenticated()
            });
        });
};
