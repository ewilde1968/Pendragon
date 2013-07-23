
/*
 * GET home page.
 */
var Game = require('./../model/game'),
    Account = require('./../model/account'),
    defaultObjects = require('./../model/defaultObjects');

//app.get('/user/:userid/game/new', user.ensureSignedIn, game.newGame);
exports.newGame = function(req, res, next){
    res.render('initialsettings',
               {accountId:req.params.userid,
                memeplexes:defaultObjects.memeplexes
               });

};

//app.post('/user/:userid/game/new', user.ensureSignedIn, game.createGame);
exports.createGame = function( req, res, next) {
    Game.factory({difficulty:req.body.difficulty,
                  memeplex:req.body.memeplex
                 },
                 req.session.userId,
                 function(err, game) {
                     if(err) return next(err);

                     Account.findByIdAndUpdate( req.session.userId,{currentGame:game.id}).exec();

                     if( game)
                         res.redirect('/user/' + req.params.userid + '/game/' + game._id.toHexString());
                     else
                         throw 'GET game:newGame - invalid Game object';
                });
};

var showGameHome = function( req, res, game) {
    res.render( 'gamehome',
               {accountId:req.params.userid,
                gameId:req.params.gameid,
                game:game,
                leaderCost:100,
                turnResources:game?game.memeplexes[0].availableResources():0
               });
};

//app.get('/user/:userid/game/:gameid', user.ensureSignedIn, game.home);
exports.home = function( req, res, next) {
    Game.findById( req.params.gameid, function(err,game) {
        if(err) return err;
        showGameHome( req, res, game);
    });
};

//app.post('/user/:userid/game/:gameid', user.ensureSignedIn, game.update);
exports.update = function( req, res, next) {
    Game.findById( req.params.gameid, function(err,game) {
        if(err) return err;
        game.mergeOptions( req.body);
        game.nextTurn( function(err,game) {
            if(err) return err;
            showGameHome( req, res, game);
        });
    });
};