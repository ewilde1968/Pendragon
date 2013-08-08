/*
 * Skill model
*/
/*global export, require, module */
var Skill; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var levelValidator = function (val) {
    "use strict";
    if ('number' !== typeof val || val > 5 || val < 0) {
        return false;
    }

    return true;
};


var SkillSchema = new Schema({
    name:           { type: String, required: true },
    level:          { type: Number, validator: levelValidator },
    experience:     Boolean
});


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
    
    return this;
};

SkillSchema.methods.experienceCheck = function () {
    "use strict";
    if (Math.floor(Math.random() * 20 + 1) >= (this.level * 5)) {
        this.increase();
    }
    
    return this;
};

var Skill = mongoose.model('Skill', SkillSchema);
module.exports = Skill;
