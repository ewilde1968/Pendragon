/*
 * Squire model
*/
var Squire, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var SquireSchema = Character.schema.extend({
});


SquireSchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Squire(template);
    result.initialize(template);

    result.profession = 'Squire';

    if (firstKnight) {
        result.queuedEvents.push(result.fatherHistory());
    }

    // will add to body, skills and honor when they reach 21 and achieve knighthood
    if (!template.age) {result.age = 16; }
    result.soul -= 1;
    result.honor = 4;
    result.skills.push(Skill.factory({name: 'Swordsmanship', level: 1}));
    result.skills.push(Skill.factory({name: 'Horsemanship', level: 1}));
    result.skills.push(Skill.factory({name: 'Spear', level: 1}));

    return result;
};

SquireSchema.methods.increaseAge = function () {
    "use strict";
    this.prototype.increaseAge();

    if (this.age === 21) {
        // coming of age
        this.increaseSkill('Swordsmanship');
        this.increaseSkill('Horsemanship');
        this.increaseSkill('Spear');
    } else if (this.age === 19) {
        // gaining skill
        this.increaseSkill('Swordsmanship');
        this.increaseSkill('Horsemanship');
        this.increaseSkill('Spear');
    }
    
    return this;
};


var Squire = mongoose.model('Squire', SquireSchema);
module.exports = Squire;
