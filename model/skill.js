/*
 * Skill model
*/
var Skill, require, module, set_level; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SkillSchema = new Schema({
    name:           { type: String, required: true },
    level:          { typs: Number, set: set_level },
    experience:     Boolean
});


function set_level(val) {
    "use strict";
    if ('number' !== typeof val) {val = 0; } else if (val > 5) {val = 5; } else if (val < 0) {val = 0; }

    return val;
}

SkillSchema.statics.factory = function (template) {
    "use strict";
    var result = new Skill({name: template.name,
                            level: template.level || 0,
                            experience: template.experience || false
                           });
    
    return result;
};

SkillSchema.methods.increase = function (value) {
    "use strict";
    value = value || 1;

    this.level += value;
};

SkillSchema.methods.experienceCheck = function () {
    "use strict";
    if (Math.floor(Math.random() * 20 + 1) >= (this.level * 5)) {
        this.increase();
    }
};

var Skill = mongoose.model('Skill', SkillSchema);
module.exports = Skill;
