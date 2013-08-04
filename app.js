
/**
 * Module dependencies.
 */
var express = require('express'),
    database = require('./model/database'),
    routes = require('./routes'),
    user = require('./routes/user'),
    game = require('./routes/game'),
    http = require('http'),
    path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('pendragonCookieSecret'));
app.use(express.session({ secret: 'pendragonSessionSecret'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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
