/**
 * Module Dependencies.
 */
var http = require('http');
/**
 * Pull these out into a Docker Remote API Wrapper eventually, or a HAPI.
 * ---------------------------------------------------------------------------------------------------------------------
 */
module.exports = exports = {
    /**
     * Create a container
     *
     * POST /containers/create
     * Create a container
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param config is the Docker Container's Configuration.
     * @param name is the Docker Container's name. It is optional, but if included, it must
     * match /?[a-zA-Z0-9_-]+.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a Container {Object} if successful, or
     * {null} if failure.
     */
    createContainer: function (socketPath, config, name, callback) {
        var queryString = typeof name === 'string' ? ('?name=' + name) : '',
            request =
                http
                    .request({
                        method: 'POST',
                        path: '/containers/create' + queryString,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        socketPath: socketPath
                    }, function (res) {
                        if (res.statusCode === 201) {
                            var container = '';
                            res
                                .on('data', function (data) {
                                    container += data;
                                })
                                .on('end', function () {
                                    return callback(JSON.parse(container));
                                });
                        } else {
                            return callback(null);
                        }
                    })
                    .on('error', function (e) {
                        return callback(null);
                    });
        request.write(JSON.stringify(config));
        request.end();
    },
    /**
     * Start a container
     *
     * POST /containers/(id)/start
     * Start the container id
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param id is the Identifier of the Docker Container.
     * @param hostConfig is the Docker Container's Host Configuration. It is optional.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a {boolean} true if successful, or
     * {boolean} false if failure.
     */
    startContainer: function (socketPath, id, hostConfig, callback) {
        hostConfig = !!hostConfig && typeof hostConfig === 'object' ? hostConfig : {}
        var request =
            http
                .request({
                    method: 'POST',
                    path: '/containers/' + id + '/start',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    socketPath: socketPath
                }, function (res) {
                    return callback(res.statusCode === 204);
                })
                .on('error', function (e) {
                    return callback(false);
                });
        request.write(JSON.stringify(hostConfig));
        request.end();
    },
    /**
     * Stop a container
     *
     * POST /containers/(id)/stop
     * Stop the container id
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param id is the Identifier of the Docker Container.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a {boolean} true if successful, or
     * {boolean} false if failure.
     */
    stopContainer: function (socketPath, id, callback) {
        http
            .request({
                method: 'POST',
                path: '/containers/' + id + '/stop',
                socketPath: socketPath
            }, function (res) {
                return callback(res.statusCode === 204);
            })
            .on('error', function (e) {
                return callback(false);
            })
            .end();
    },
    /**
     * Restart a container
     *
     * POST /containers/(id)/restart
     * Restart the container id
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param id is the Identifier of the Docker Container.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a {boolean} true if successful, or
     * {boolean} false if failure.
     */
    restartContainer: function (socketPath, id, callback) {
        http
            .request({
                method: 'POST',
                path: '/containers/' + id + '/restart',
                socketPath: socketPath
            }, function (res) {
                return callback(res.statusCode === 204);
            })
            .on('error', function (e) {
                return callback(false);
            })
            .end();
    },
    /**
     * Remove a container
     *
     * DELETE /containers/(id)
     * Remove the container id from the filesystem
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param id is the Identifier of the Docker Container.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a {boolean} true if successful, or
     * {boolean} false if failure.
     */
    removeContainer: function (socketPath, id, callback) {
        http
            .request({
                method: 'DELETE',
                path: '/containers/' + id,
                socketPath: socketPath
            }, function (res) {
                return callback(res.statusCode === 204);
            })
            .on('error', function (e) {
                return callback(false);
            })
            .end();
    },
    /**
     * Inspect a container
     *
     * GET /containers/(id)/json
     * Return low-level information on the container id.
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param id is the Identifier of the Docker Container.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a Container {Object} if successful, or
     * {null} if failure.
     */
    inspectContainer: function (socketPath, id, callback) {
        http
            .request({
                method: 'GET',
                path: '/containers/' + id + '/json',
                socketPath: socketPath
            }, function (res) {
                if (res.statusCode === 200) {
                    var container = '';
                    res
                        .on('data', function (data) {
                            container += data;
                        })
                        .on('end', function () {
                            return callback(JSON.parse(container));
                        });
                } else {
                    return callback(null);
                }
            })
            .on('error', function (e) {
                return callback(null);
            })
            .end();
    },
    /**
     * List containers
     *
     * GET /containers/json
     * List containers
     *
     * @param socketPath is the Docker Unix Domain Socket path.
     * @param callback is a Callback {Function} Object with an arity of one.
     * The argument of the Callback {Function} should be expecting a Container {Array} if successful, or
     * {null} if failure.
     */
    listContainers: function (socketPath, callback) {
        http
            .request({
                method: 'GET',
                path: '/containers/json?all=1',
                socketPath: socketPath
            }, function (res) {
                if (res.statusCode === 200) {
                    var containers = '';
                    res
                        .on('data', function (data) {
                            containers += data;
                        })
                        .on('end', function () {
                            return callback(JSON.parse(containers));
                        });
                } else {
                    return callback(null);
                }
            })
            .on('error', function (e) {
                return callback(null);
            })
            .end();
    }
};
