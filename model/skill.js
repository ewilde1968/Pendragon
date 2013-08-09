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

SkillSchema.methods.check = function () {
    "use strict";
    var roll = Math.floor(Math.random() * 20 + 1);
    
    if (this.level === 5) {
        if (roll >= 15) {
            return {result: 'Critical Success', roll: roll + 5};
        }
        return {result: 'Success', roll: roll + 5};
    } else if (roll === this.level * 5) {
        return {result: 'Critical Success', roll: roll};
    } else if (roll < this.level * 5) {
        return {result: 'Success', roll: roll};
    } else if (roll === 20) {
        return {result: 'Fumble', roll: roll};
    }
    
    return {result: 'Failure', roll: roll};
};

SkillSchema.methods.opposed = function (enemySkill) {
    "use strict";
    var result,
        enemyRoll = enemySkill.check(),
        myRoll = this.check();
    
    if (myRoll.result === enemyRoll.result) {
        result = (myRoll.roll >= enemyRoll.roll) ? 'Success' : 'Failure';
    } else {
        switch (myRoll.result) {
        case 'Critical Success':
            if (enemyRoll.result === 'Success') {
                result = 'Success';
            } else {
                result = 'Critical Success';
            }
            break;
        case 'Success':
            if (enemyRoll.result === 'Critical Success') {
                result = 'Failure';
            } else if (enemyRoll.result === 'Fumble') {
                result = 'Critical Success';
            } else {
                result = 'Success';
            }
            break;
        case 'Failure':
            if (enemyRoll.result === 'Critical Success') {
                result = 'Fumble';
            } else if (enemyRoll.result === 'Fumble') {
                result = 'Success';
            } else {
                result = 'Failure';
            }
            break;
        case 'Fumble':
            if (enemyRoll.result === 'Failure') {
                result = 'Failure';
            } else {
                result = 'Fumble';
            }
            break;
        default:
            throw {
                name: 'Invalid Roll',
                message: this.name + ' has invalid roll result'
            };
        }
    }
    
    return result;
};


var Skill = mongoose.model('Skill', SkillSchema);
module.exports = Skill;
