var passport = require('passport');
module.exports.get = exports.get = function (req, res) {
    res.render('login', { title: 'Sign In', user: req.isAuthenticated() });
};
module.exports.post = exports.post = passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
});
