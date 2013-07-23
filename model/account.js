
/*
 * User model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var AccountSchema = new Schema( {
    first:      String,
    last:       String,
    email:      { type:String, unique:true, required:true },
    password:   { type:String, index:true, required:true },
    currentGame:ObjectId,
    admin:      { type:Boolean, default:false }
});


AccountSchema.statics.newAccount = function( username, password, cb) {
    // assume logged in appropriately by this point
    var acct = new Account( {email:username, password:password});
    if( acct) {
        acct.save( function(err) {
            if( cb) cb( err, acct);
        });
    } else
        throw "Account.updateAccount - new Account failed";
};

AccountSchema.statics.updateAccount = function( userId, username, password) {
    // assume logged in appropriately by this point
    var acct = Account.findByIdAndUpdate( userId,
                                         {email:username, password:password}
                                        ).exec();
};

AccountSchema.statics.login = function( username, password, cb) {
    var acct = Account.findOne( {email:username, password:password}, cb);
};

var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;
