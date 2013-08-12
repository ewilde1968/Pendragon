
/*
 * GET home page.
 */
/*global exports, require, module */

var Game = require('./../model/game'),
    Account = require('./../model/account'),
    defaultObjects = require('./../model/defaultObjects'),
    Character = require('./../model/character'),
    Family = require('./../model/family');

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

var showGameHome = function (req, res, data) {
    "use strict";
    if (data && data.game) {
        res.render('gamehome',
                   {accountId: req.params.userid,
                    gameId: req.params.gameid,
                    game: data.game,
                    events: data.events,
                    family: data.family,
                    patriarch: data.patriarch,
                    holdings: data.holdings,
                    bros: data.bros,
                    ladies: data.ladies,
                    extended: data.extended
                   });
    } else {
        res.render('gamehome', {accountId: req.params.userid});
    }
};

var accountHome = function (req, res, next) {
    "use strict";
    Account.findById(req.session.userId, function (err, acct) {
        if (err || !acct) {return next(err); }

        acct.clearHome(function (err, a) {
            if (err || !a) {return next(err); }
            res.redirect('/user/' + a.id);
        });
    });
};

//app.get('/user/:userid/game/:gameid', user.ensureSignedIn, game.home);
exports.home = function (req, res, next) {
    "use strict";
    Game.findById(req.params.gameid, function (err, game) {
        if (err) {return err; }
        if (game) {
            game.getEvents(function (data) {
                showGameHome(req, res, data);
            });
        } else {
            accountHome(req, res, next);
        }
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

            if (game.turn.quarter === req.body.changes.turn.quarter && game.turn.year === req.body.changes.turn.year) {
                game.nextTurn(req.body, function (data) {
                    showGameHome(req, res, data);
                });
            } else {
                // submitted turn doesn't match state of game, ignore the submission
                game.getEvents(function (data) {
                    showGameHome(req, res, data);
                });
            }
        } else {
            accountHome(req, res, next);
        }
    });
};
