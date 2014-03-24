/**
 * Module Dependencies.
 */
var crypto = require('crypto'),
    mongoose = require('mongoose');

/**
 * Password Hashing Function.
 */
function hash(pwd, salt, fn) {
    var iterations = 12000,
        keyLength = 128;
    if (3 == arguments.length) {
        crypto.pbkdf2(pwd, salt, iterations, keyLength, fn);
    } else {
        fn = salt;
        crypto.randomBytes(keyLength, function (err, salt) {
            if (err) {
                return fn(err);
            }
            salt = salt.toString('base64');
            crypto.pbkdf2(pwd, salt, iterations, keyLength, function (err, hash) {
                if (err) {
                    return fn(err);
                }
                fn(null, salt, hash);
            });
        });
    }
}

var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    salt: String,
    hash: String,
    github: {
        id: String,
        email: String,
        name: String
    },
    hapis: []
})
    .static('signup', function (email, password, done) {
        var that = this;
        hash(password, function (err, salt, hash) {
            var user = {
                email: email,
                salt: salt,
                hash: hash
            };
            if (err) {
                throw err;
            }
            that.create(user, function (err, user) {
                if (err) {
                    throw err;
                }
                done(null, user);
            });
        });
    })
    .static('isValidUserPassword', function (email, password, done) {
        this.findOne({ email: email }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            hash(password, user.salt, function (err, hash) {
                if (err) {
                    return done(err);
                }
                if (hash == user.hash) {
                    return done(null, user);
                }
                done(null, false, {
                    message: 'Incorrect password'
                });
            });
        });
    })
    .static('findOrCreateOAuthUser', function (profile, done) {
        var that = this,
            query = {};

        query[profile.authOrigin + '.id'] = profile.id;

        that.findOne(query, function (err, user) {
                if (err) {
                    throw err;
                }
                if (user) {
                    done(null, user);
                } else {
                    that.findOne({
                        'email': profile.emails[0].value
                    }, function (err, user) {
                        if (err) {
                            throw err;
                        }
                        if (user) {
                            user['' + profile.authOrigin] = {};
                            user['' + profile.authOrigin].id = profile.id;
                            user['' + profile.authOrigin].email = profile.emails[0].value;
                            user['' + profile.authOrigin].name = profile.displayName;

                            user.save(function (err, user) {
                                if (err) {
                                    throw err;
                                }
                                done(null, user);
                            });
                        } else {
                            user = {
                                email: profile.emails[0].value,
                                firstName: profile.displayName.split(' ')[0],
                                lastName: profile.displayName.replace(
                                    profile.displayName.split(' ')[0] + ' ', ''
                                )
                            };
                            user['' + profile.authOrigin] = {};
                            user['' + profile.authOrigin].id = profile.id;
                            user['' + profile.authOrigin].email = profile.emails[0].value;
                            user['' + profile.authOrigin].name = profile.displayName;

                            that.create(user, function (err, user) {
                                if (err) {
                                    throw err;
                                }
                                done(null, user);
                            });
                        }
                    });
                }
            }
        );
    })
    .static('addHapiForUser', function (email, hapi) {
        var that = this;
        that.findOneAndUpdate(
            {
                email: email
            },
            {
                $push: {
                    hapis: hapi
                }
            },
            function (err, model) {
                if (err) {
                    console.log(err);
                }
                console.log(model);
            }
        );
    })
    .static('getHapisForUser', function (email, callback) {
        var that = this;
        that.findOne(
            {
                email: email
            },
            callback
        );
    })
    .static('getLargestHapiPort', function (callback) {
        var that = this;
        that.find({}, callback);
    });
module.exports = exports = mongoose.model('User', userSchema);
