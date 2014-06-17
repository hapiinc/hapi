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

module.exports = exports = mongoose.model('User',
    mongoose
        .Schema({
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
        .static('addHapi', function (user, hapi, done) {
            this.findOneAndUpdate(user, {
                $push: {
                    hapis: hapi
                }
            }, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user) {
                    return done(null, hapi);
                }
            });
        })
        .static('removeHapi', function (user, hapi, done) {
            this.findOneAndUpdate(user, {
                $pull: {
                    hapis: hapi
                }
            }, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user) {
                    return done(null, hapi);
                }
            });
        })
        .static('getHapiById', function (user, id, done) {
            this.findOne(user, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user) {
                    var hapis = user.hapis;
                    for (var hapi in hapis) {
                        hapi = hapis[hapi];
                        if (hapi.id === id) {
                            return done(null, hapi);
                        }
                    }
                    return done(null, null);
                }
            });
        })
        .static('getHapis', function (user, done) {
            this.findOne(user, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user) {
                    return done(null, user.hapis);
                }
            });
        })
);
