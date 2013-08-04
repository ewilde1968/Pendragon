
/*
 * GET home page.
 */
var exports, require, module; // forward to clear out JSLint errors

var Game = require('./../model/game'),
    Account = require('./../model/account'),
    defaultObjects = require('./../model/defaultObjects'),
    Character = require('./../model/character');

//app.get('/user/:userid/game/new', user.ensureSignedIn, game.newGame);
exports.newGame = function (req, res, next) {
    "use strict";
    res.render('initialsettings',
               {accountId: req.params.userid,
                families: defaultObjects.families
               });

};

//app.post('/user/:userid/game/new', user.ensureSignedIn, game.createGame);
exports.createGame = function (req, res, next) {
    "use strict";
    Game.factory({difficulty: req.body.difficulty,
                  family: req.body.family
                 },
                 req.session.userId,
                 function (err, game) {
            if (err) {return next(err); }

            Account.findByIdAndUpdate(req.session.userId, {currentGame: game.id}).exec();

            if (game) {
                res.redirect('/user/' + req.params.userid + '/game/' + game.id);
            } else {
                throw {
                    name: 'invalid Game object',
                    message: 'GET game:newGame - game.exports.createGame'
                };
            }
        });
};

var showGameHome = function (req, res, game) {
    "use strict";
    res.render('gamehome',
               {accountId: req.params.userid,
                gameId: req.params.gameid,
                game: game,
                events: game ? game.getEvents() : null
               });
};

//app.get('/user/:userid/game/:gameid', user.ensureSignedIn, game.home);
exports.home = function (req, res, next) {
    "use strict";
    Game.findById(req.params.gameid, function (err, game) {
        if (err) {return err; }
        showGameHome(req, res, game);
    });
};

//app.post('/user/:userid/game/:gameid', user.ensureSignedIn, game.update);
exports.update = function (req, res, next) {
    "use strict";
    Game.findById(req.params.gameid, function (err, game) {
        if (err) {return err; }

        if (game) {
            // setup next quarter
            if (req.body && req.body.changes) {
                req.body.changes = JSON.parse(req.body.changes);
            }

            game.endQuarter()
                .mergeOptions(req.body)
                .nextTurn(function (err, game) {
                    if (err) {return err; }
                    showGameHome(req, res, game);
                });
        } else {
            res.redirect('/user/' + req.params.userid);
        }
    });
};

//socket.io request to get family member data for member details page
exports.getMember = function (gameId, memberId, cb) {
    "use strict";
    Game.findById(gameId, function (err, game) {
        if (err) {return err; }

        if (game && game.families && game.families.length > 0 && cb) {
            cb(game.families[0].getMember(memberId));
        }
    });
};

//socket.io request to get locale data for locale details page
exports.getLocale = function (gameId, localeId, cb) {
    "use strict";
    Game.findById(gameId, function (err, game) {
        if (err) {return err; }

        if (game && game.families && game.families.length > 0 && cb) {
            var l = game.families[0].getHolding(localeId);
            cb(l, (l && l.steward) ? game.families[0].getMember(l.steward) : null);
        }
    });
};
