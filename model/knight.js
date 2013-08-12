/*
 * Knight model
*/
/*global export, require, module */
var Knight; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var KnightSchema = Character.schema.extend({
});


KnightSchema.statics.factory = function (template, cb, firstKnight) {
    "use strict";
    var result = new Knight(template);
    result.initialize(template);

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

    result.save(cb);
    
    return result;
};

KnightSchema.methods.cost = function (l) {
    "use strict";
    switch (l || 'Normal') {
    case 'Poor':
        return 1;
    case 'Normal':
        return 4;
    case 'Rich':
        return 8;
    case 'Opulent':
        return 12;
    default:
        throw {
            name: 'Invalid living standard',
            message: 'CharacterSchema.methods.cost for ' + this.name
        };
    }
};


var Knight = mongoose.model('Knight', KnightSchema);
module.exports = Knight;
