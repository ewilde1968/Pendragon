
/**
 * Module dependencies.
 */
/*global exports, require, module, process, __dirname, console */

var express = require('express'),
    database = require('./model/database'),
    extend = require('mongoose-schema-extend'),
    routes = require('./routes'),
    user = require('./routes/user'),
    game = require('./routes/game'),
    http = require('http'),
    path = require('path'),
    app = express(),
    util = require('util'),
    dn = __dirname,
    logRequest = function (req, res, next) {
        "use strict";
        if (req && 'POST' === req.method) {
            if (req.params) {console.log("Request Params: ", util.inspect(req.params, {depth: 4, colors: true})); }
            if (req.body) {console.log("Request Body: ", req.body); }
        }

        next();
    };

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', dn + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(logRequest);
app.use(express.methodOverride());
app.use(express.cookieParser('pendragonCookieSecret'));
app.use(express.session({ secret: 'pendragonSessionSecret'}));
app.use(app.router);
app.use(express.static(path.join(dn, 'public')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.signin);
app.get('/user/new', user.newUser);
app.post('/user/new', user.createUser);
app.get('/user/:userid', user.ensureSignedIn, user.home);
app.post('/user/:userid', user.ensureSignedIn, user.update);
app.get('/user/:userid/game/new', user.ensureSignedIn, game.newGame);
app.post('/user/:userid/game/new', user.ensureSignedIn, game.createGame);
app.get('/user/:userid/game/:gameid', user.ensureSignedIn, game.home);
app.post('/user/:userid/game/:gameid', user.ensureSignedIn, game.update);

// setup DB
app.database = database('pendragon').initialize();

http.createServer(app).listen(app.get('port'), function () {
    "use strict";
    console.log('Express server listening on port ' + app.get('port'));
});
