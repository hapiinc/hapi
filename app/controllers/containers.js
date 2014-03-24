module.exports.controller = function (app) {
    var fs = require('fs'),
        https = require('https'),
        key = fs.readFileSync('ssl/key.pem', 'utf8'),
        cert = fs.readFileSync('ssl/cert.pem', 'utf8'),
        user = require('../models/user.js');

    function startContainer(containerId, sshPort, httpPort, callback) {
        var request = https.request(
            {
                host: 'hapi.co',
                port: '4243',
                method: 'POST',
                path: '/containers/' + containerId + '/start',
                headers: {'Content-Type': 'application/json'},
                key: key,
                cert: cert,
                rejectUnauthorized: false,
                agent: false
            },
            callback
        )
            .on('error', function (e) {
                console.error(e);
            });
        request.write(JSON.stringify({
            'PortBindings': {
                '22/tcp': [
                    { 'HostPort': sshPort.toString() }
                ],
                '8080/tcp': [
                    { 'HostPort': httpPort.toString() }
                ]
            }
        }));
        request.end();
    }

    app
        .post('/containers/hapi', function (req, res, next) {
            var email = req.user.email,
                hostName = req.body.name,
                sshKey = req.body.sshkey,
                hapiResponse = res;
            if (req.isAuthenticated()) {
                var request = https.request(
                    {
                        host: 'hapi.co',
                        port: '4243',
                        method: 'POST',
                        path: '/containers/create',
                        headers: { 'Content-Type': 'application/json' },
                        key: key,
                        cert: cert,
                        rejectUnauthorized: false,
                        agent: false
                    },
                    function (res) {
                        var response = '';
                        res
                            .on('data', function (data) {
                                response += data;
                            })
                            .on('end', function () {
                                if (res.statusCode === 201) {
                                    var container = JSON.parse(response),
                                        containerId = container.Id;

                                    user.getLargestHapiPort(function (err, users) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var currentPort = 49152;
                                            for (var u in users) {
                                                u = users[u];
                                                if (u.hapis.length > 0) {
                                                    var hapis = u.hapis;
                                                    for (var hapi in hapis) {
                                                        hapi = hapis[hapi];
                                                        if (hapi.sshPort > currentPort) {
                                                            currentPort = hapi.sshPort;
                                                        }
                                                        if (hapi.httpPort > currentPort) {
                                                            currentPort = hapi.httpPort;
                                                        }
                                                    }
                                                }
                                            }

                                            var sshPort = currentPort + 1,
                                                httpPort = currentPort + 2;

                                            startContainer(containerId, sshPort, httpPort, function callback(res) {
                                                    if (res.statusCode === 204) {
                                                        user.addHapiForUser(email, {
                                                            'containerId': containerId,
                                                            'hostName': hostName,
                                                            'sshKey': sshKey,
                                                            'sshPort': sshPort,
                                                            'httpPort': httpPort
                                                        });
                                                        hapiResponse.redirect('profile');
                                                    } else {
                                                        sshPort += 1;
                                                        httpPort += 1;
                                                        startContainer(containerId, sshPort, httpPort, callback);
                                                    }
                                                }
                                            );
                                        }
                                    });
                                }
                            });
                    }
                )
                    .on('error', function (e) {
                        console.error(e);
                    });
                request.write(JSON.stringify({
                    'ExposedPorts': {
                        '22/tcp': {},
                        '8080/tcp': {}
                    },
                    'Env': [
                        'SSHKEY=' + sshKey,
                        'HOME=/',
                        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
                    ],
                    'Cmd': [ '/bin/sh', '-c', '"/opt/bin/entry"' ],
                    'Image': 'hapi/hapi'
                }));
                request.end();
            } else {
                res.redirect('/');
            }
        });
};
