/*
 * User model
*/
/*global export, require, module */

var Account; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var AccountSchema = new Schema({
    first:          String,
    last:           String,
    email:          { type: String, unique: true, required: true },
    password:       { type: String, required: true },
    currentGame:    ObjectId,
    admin:          Boolean
});


AccountSchema.statics.newAccount = function (username, password, cb) {
    "use strict";
    // assume logged in appropriately by this point
    var acct = new Account({email: username, password: password});
    if (acct) {
        acct.save(cb);
    } else {
        throw {
            name: "new Account failed",
            message: "Account.updateAccount"
        };
    }
    
    return acct;
};

AccountSchema.statics.updateAccount = function (userId, username, password) {
    "use strict";
    // assume logged in appropriately by this point
    var acct = Account.findByIdAndUpdate(userId,
                                         {email: username, password: password}
                                        ).exec();
    
    return acct;
};

AccountSchema.statics.login = function (username, password, cb) {
    "use strict";
    var acct = Account.findOne({email: username, password: password}, cb);
    
    return acct;
};

AccountSchema.methods.clearHome = function (cb) {
    "use strict";
    this.currentGame = null;
    this.save(cb);
    
    return this;
};

Account = mongoose.model('Account', AccountSchema);
module.exports = Account;
