/*
 * Character model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CharacterSchema = new Schema( {
    name:           { type:String, required:true }
});


CharacterSchema.statics.factory = function( name) {
    var result = new Character({name:name
                               });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
