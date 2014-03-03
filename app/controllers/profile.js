module.exports.get = exports.get = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};
module.exports.getTwo = exports.getTwo = function (req, res) {
    res.render('profile', { title: 'Profile', user: req.isAuthenticated() });
};
