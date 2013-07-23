
/*
 * users routes
 */
var Account = require('./../model/account');

//app.use( function(q,r,n) {user.ensureSignedIn(q,r,n);});
exports.ensureSignedIn = function(req, res, next) {
    // make sure the user is signed in and, if not, redirect to login page
    if( req.session.userId != null && req.session.userId == req.params.userid)
        next(); // TODO: use something more secure to ensure signin legitimate
    else
        res.redirect( '/');
};

//app.get('/user/new', user.newUser);
exports.newUser = function(req, res, next) {
    res.render( 'createaccount', {err:false});
};

//app.post('/user/new', user.createUser);
exports.createUser = function(req, res, next) {
    Account.newAccount( req.body.username, req.body.password, function( err, acct) {
        if( err) return next(err);

        if( acct) {
            // sign in
            req.session.userId = acct._id.toHexString();    // TODO: use something more secure

            // show user page
            res.redirect( '/user/' + req.session.userId);
        } else {
            // duplicate user or invalid password
            res.render( 'createaccount', {err:true});
        }
    });
};

//app.post('/user/:userid', user.update);
exports.update = function(req, res, next) {
    Account.updateAccount( req.session.userId, req.body.username, req.body.password);
    res.redirect( '/user/' + req.session.userId);
};

//app.get('/user/:userid', user.home);
exports.home = function(req, res, next) {
    Account.findById( req.session.userId, function( err, acct) {
        if( err || !acct) return next(err);

        if( acct.currentGame)
            res.redirect( '/user/' + req.session.userId + '/game/' + acct.currentGame);
        else
            res.render( 'gamehome', {accountId:req.session.userId});
    });
};