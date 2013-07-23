/*
 * Family model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Locale = require('./locale'),
    Character = require('./character');

var FamilySchema = new Schema( {
    name:           { type:String, required:true },
    locales:        [Locale.schema],
    members:        [Character.schema]
});


FamilySchema.statics.factory = function( template, settings, cb) {
    var result = new Family({name:template.name
                            });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};

FamilySchema.methods.mergeOptions = function(options) {
};

FamilySchema.methods.endQuarter = function() {
};

FamilySchema.methods.resources = function() {
    return 6;   // TODO
};


var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
