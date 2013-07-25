/*
 * Skill model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SkillSchema = new Schema( {
    name:           { type:String, required:true },
    level:          { type:String, default:'Untrained' }
});


SkillSchema.statics.factory = function( template, cb) {
    var result = new Skill({name:template.name,
                            level:template.level?template.level:Skill.descriptions[0]
                           });

    if(!!result && !!cb)
        cb(result);
    
    return result;
};

SkillSchema.statics.descriptions = ['Untrained','Neophyte','Journeyman','Skilled','Master','Mythic'];


var Skill = mongoose.model('Skill', SkillSchema);
module.exports = Skill;
