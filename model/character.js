/*
 * Character model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CharacterSchema = new Schema( {
    name:           { type:String, required:true, index:true },
    class:          { type:String, required:true },
    age:            Number,
    health:         String,
    armor:          String,
    shield:         Boolean,
    horses:         [{name:String,breed:String,barding:String,health:String}]
});


CharacterSchema.statics.factory = function( template, firstKnight, cb) {
    var result = new Character(template);

    if( firstKnight)
        result.fatherHistory();

    if(!!result && !!cb)
        cb(result);
    
    return result;
};

CharacterSchema.methods.fatherHistory = function() {
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
