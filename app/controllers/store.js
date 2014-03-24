module.exports.controller = function (app) {
    app
        .get('/store', function (req, res, next) {
            res.render('store.html', {
                layout: false,
                title: 'Store',
                user: req.isAuthenticated()
            });
        });
};
