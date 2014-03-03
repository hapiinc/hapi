var models = require('../models'),
    user = models.user;
module.exports.get = exports.get = function (req, res) {
    res.render('signup', { title: 'Sign Up', user: req.isAuthenticated() });
};
module.exports.post = exports.post = function (req, res, next) {
    user.count({ email: req.body.email }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect('/signup');
        }
    });
};
module.exports.postTwo = exports.postTwo = function (req, res, next) {
    user.signup(req.body.email, req.body.password, function (err, user) {
        if (err) {
            throw err;
        }
        /**
         * Temporary.
         */
        var created = '';
        var call = require('https')
            .request({
                host: '54.84.109.160',
                port: '4243',
                method: 'POST',
                path: '/containers/create',
                headers: {
                    'Content-Type': 'application/json'
                },
                key: require('fs').readFileSync('ssl/key.pem', 'utf8'),
                cert: require('fs').readFileSync('ssl/cert.pem', 'utf8'),
                rejectUnauthorized: false,
                agent: false
            }, function (res) {
                res
                    .on('data', function (data) {
                        created += data;
                    })
                    .on('end', function () {
                        created = JSON.parse(created);
                        console.dir(created);
                        var call = require('https')
                            .request({
                                host: '54.84.109.160',
                                port: '4243',
                                method: 'POST',
                                path: '/containers/' + created.Id + '/start',
                                headers: {'Content-Type': 'application/json'},
                                key: require('fs').readFileSync('ssl/key.pem', 'utf8'),
                                cert: require('fs').readFileSync('ssl/cert.pem', 'utf8'),
                                rejectUnauthorized: false,
                                agent: false
                            })
                            .on('error', function (e) {
                                console.error(e);
                            });
                        call.write(JSON.stringify({
                            "PortBindings": {
                                "22/tcp": [
                                    { "HostPort": "0" }
                                ],
                                "8080/tcp": [
                                    { "HostPort": "0" }
                                ]
                            }
                        }));
                        call.end();
                    });
            })
            .on('error', function (e) {
                console.error(e);
            });
        call.write(JSON.stringify({
            "ExposedPorts": {
                "22/tcp": {},
                "8080/tcp": {}
            },
            "Env": [
                "SSHKEY=ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDFHvVymO0puN7sR7caN5OQG0ms4+Nl3uSrYuJcS+G3voY3mlmBL6eRc1Exmxc2oM0CPvVV1EDt2gJlZeM3RwesTaYyPxgkDAG9lug8Xs2zLsMKMTdayWjB1+Hiz1voHrlbFFvAx8zRciHXpRQ8Qlcl/Vt2t5MK7TGu9bR+27rLVFstnDWW3OI3FSRZZhZH6N19EfoBVMRBvkWtrwpoqzkT2dSfAM3E1q7hIqfyu9VxVVGXZ3JZsrQ83Dk8nuDaj8tDdIEUYlIYjXxgntLBEAuZcHwpa/sTEfvOpXYUVz8QG+j8TUIi2ZxBU0j7/VLg2yH2XT2S3ma2dgJp4aRx96AR tony@hapi.co",
                "HOME=/",
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "\"/opt/bin/entry\""
            ],
            "Image": "hapi/hapi"
        }));
        call.end();
        /**
         * Temporary.
         */
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('profile');
        });
    });
}
