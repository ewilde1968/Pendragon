
/*
 * GET home page.
 */
/*global exports, require, module */

var Account = require('./../model/account');

//app.get('/', routes.index);
exports.index = function (req, res) {
    "use strict";
    // show title screen and require sign in to do anything else
    res.render('index', { err: false, defaultUsername: '' });
};

//app.post('/', routes.signin);
exports.signin = function (req, res, next) {
    "use strict";
    Account.login(req.body.username, req.body.password, function (err, acct) {
        if (err) {return next(err); }

        if (acct) {
            req.session.userId = acct.id;    // TODO: use something more secure
            res.redirect('/user/' + req.session.userId);
        } else {
            // incorrect username or password
            res.render('index', { err: true, defaultUsername: req.body.username });
        }
    });
};