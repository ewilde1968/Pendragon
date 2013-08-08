/*
 * Steward model
*/
/*global export, require, module */
var Steward; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var StewardSchema = Character.schema.extend({
});


StewardSchema.statics.factory = function (template) {
    "use strict";
    var result = new Steward(template);
    result.initialize(template);

    result.profession = 'Steward';

    if (!template.age) {result.age = 21; }
    result.honor = 4;
    result.skills.push(Skill.factory({name: 'Stewardry', level: 3}));
    result.skills.push(Skill.factory({name: 'Swordsmanship', level: 1}));
    result.skills.push(Skill.factory({name: 'Horsemanship', level: 1}));
    result.skills.push(Skill.factory({name: 'Spear', level: 1}));

    return result;
};


var Steward = mongoose.model('Steward', StewardSchema);
module.exports = Steward;
