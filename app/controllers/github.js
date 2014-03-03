var passport = require('passport');
module.exports.get = exports.get = passport.authenticate('github', {
    scope: 'email'
});
module.exports.callback = exports.callback = passport.authenticate('github', {
    successRedirect: '/profile',
    failureRedirect: '/login'
});
