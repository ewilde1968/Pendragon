/*
 * Knight model
*/
var Knight, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var KnightSchema = Character.schema.extend({
});


KnightSchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Knight(template);
    result.initialize();

    result.profession = 'Knight';

    if (!template.age) {result.age = 21; }
    result.soul -= 1;
    result.body += 1;
    result.health = result.body;
    result.honor = 5;
    result.skills.push(Skill.factory({name: 'Swordsmanship', level: 3}));
    result.skills.push(Skill.factory({name: 'Horsemanship', level: 3}));
    result.skills.push(Skill.factory({name: 'Spear', level: 3}));
    result.armor = 'Chain Hauberk';
    result.shield = true;

    return result;
};


var Knight = mongoose.model('Knight', KnightSchema);
module.exports = Knight;
