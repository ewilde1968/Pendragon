/*
 * Skill model
*/
var Skill, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SkillSchema = new Schema({
    name:           { type: String, required: true },
    level:          Number
});


SkillSchema.statics.factory = function (template) {
    "use strict";
    var result = new Skill({name: template.name,
                            level: template.level || 0
                           });
    
    return result;
};


var Skill = mongoose.model('Skill', SkillSchema);
module.exports = Skill;
