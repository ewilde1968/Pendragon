
/*
 * User model
*/

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
        throw "Account.updateAccount - new Account failed";
    }
};

AccountSchema.statics.updateAccount = function (userId, username, password) {
    "use strict";
    // assume logged in appropriately by this point
    var acct = Account.findByIdAndUpdate(userId,
                                         {email: username, password: password}
                                        ).exec();
};

AccountSchema.statics.login = function (username, password, cb) {
    "use strict";
    var acct = Account.findOne({email: username, password: password}, cb);
};

var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;
