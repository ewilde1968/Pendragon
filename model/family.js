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
    members:        [Character.schema],
    cash:           Number,
    specialty:      String
});


FamilySchema.statics.factory = function( template, settings, cb) {
    var result = new Family({name:template.name,
                             cash:0
                            });

    result.locales.push( Locale.factory( template.locale));
    result.members.push( Character.factory({name:'first knight',
                                            class:'knight',
                                            age:16,
                                            armor:'Chain Hauberk',
                                            shield:true
                                           },
                                           true));
    result.generateSpecialty();

    if(!!result && !!cb)
        cb(result);
    
    return result;
};

FamilySchema.methods.generateSpecialty = function () {
    // called only at family construction
    this.specialty = 'horsemanship';  // TODO
};

FamilySchema.methods.mergeOptions = function(options) {
};

FamilySchema.methods.endQuarter = function() {
};

FamilySchema.methods.resources = function() {
    return 6;   // TODO
};

FamilySchema.methods.getMember = function(id) {
    return this.members.id(id);
};

FamilySchema.methods.getLocale = function(id) {
    return this.locales.id(id);
};


var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
