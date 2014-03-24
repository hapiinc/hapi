module.exports.controller = function (app) {
    var user = require('../models/user.js');

    app
        .get('/dash', function (req, res, next) {
            if (req.isAuthenticated()) {
                user.getHapisForUser(req.user.email, function (err, model) {
                    var hapis = [];
                    if (err) {
                        console.log(err);
                    } else if (model) {
                        hapis = model.hapis;
                    }
                    res.render('dash.html', {
                        layout: false,
                        title: 'Dashboard',
                        user: req.isAuthenticated(),
                        hapis: hapis
                    });
                });
            } else {
                res.redirect('/');
            }
        });
};
