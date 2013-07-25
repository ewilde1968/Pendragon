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


LocaleSchema.statics.factory = function( template, cb) {
    var result = new Locale({name:template.name,
                             income:template.income?template.income:6,
                             cost:1
                            });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};

LocaleSchema.methods.addSteward = function(s) {
    if( this.steward)
        this.cost--;

    if( s) {
        this.steward = s.id;
        if( 'Steward' == s.class)
            this.cost++;
    } else
        delete this.steward;
};

var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
