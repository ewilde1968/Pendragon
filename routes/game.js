
/*
 * GET home page.
 */
var Game = require('./../model/game'),
    Account = require('./../model/account'),
    defaultObjects = require('./../model/defaultObjects'),
    Character = require('./../model/character');

//app.get('/user/:userid/game/new', user.ensureSignedIn, game.newGame);
exports.newGame = function(req, res, next){
    res.render('initialsettings',
               {accountId:req.params.userid,
                families:defaultObjects.families
               });

};

//app.post('/user/:userid/game/new', user.ensureSignedIn, game.createGame);
exports.createGame = function( req, res, next) {
    Game.factory({difficulty:req.body.difficulty,
                  family:req.body.family
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
                game:game
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

//socket.io request to get family member data for member details page
exports.getMember = function( gameId, memberId, cb) {
    Game.findById( gameId, function(err,game) {
        if(err) return err;

        if( game && game.families && game.families.length > 0 && cb)
            cb( game.families[0].getMember( memberId));
    });
};

//socket.io request to get locale data for locale details page
exports.getLocale = function( gameId, localeId, cb) {
    Game.findById( gameId, function(err,game) {
        if(err) return err;

        if( game && game.families && game.families.length > 0 && cb) {
            var l = game.families[0].getLocale( localeId);
            cb( l, (l&&l.steward)?game.families[0].getMember( l.steward):null);
        }
    });
};
