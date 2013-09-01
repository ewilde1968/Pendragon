/*
 * Knight model
*/
/*global export, require, module */
var Knight; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Statistic = require('./statistic'),
    Character = require('./character');

var KnightSchema = Character.schema.extend({
});


KnightSchema.statics.factory = function (template, game, cb, firstKnight) {
    "use strict";
    var result = new Knight(template);
    result.initialize(template, game);

    result.profession = 'Knight';

    if (!template.age) {result.age = 21; }
    result.getStat("Body").increase(1);
    result.getStat("Soul").increase(-1);
    result.getStat("Health").increase(1);
    result.statistics.push(Statistic.factory({name: 'Honor', level: 6}));
    result.statistics.push(Statistic.factory({name: 'Swordsmanship', level: 5}));
    result.statistics.push(Statistic.factory({name: 'Horsemanship', level: 5}));
    result.statistics.push(Statistic.factory({name: 'Spear', level: 5}));
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
