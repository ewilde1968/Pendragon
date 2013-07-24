/*
 * Locale model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var LocaleSchema = new Schema( {
    name:           { type:String, required:true },
    income:         Number,
    cost:           Number,
    steward:        ObjectId
});


LocaleSchema.statics.factory = function( name, cb) {
    var result = new Locale({name:name,
                             income:6,
                             cost:0
                            });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};


var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
