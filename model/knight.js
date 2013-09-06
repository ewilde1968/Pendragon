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


KnightSchema.statics.factory = function (template, game, family, cb, firstKnight) {
    "use strict";
    var result = new Knight(template);
    result.initialize(template, game, family, function (k) {
        k.profession = 'Knight';

        if (!template.age) {k.age = 21; }
        k.getStat("Body").increase(1);
        k.getStat("Soul").increase(-1);
        k.getStat("Health").increase(1);
        k.statistics.push(Statistic.factory({name: 'Honor', level: 6}));
        k.statistics.push(Statistic.factory({name: 'Swordsmanship', level: 5}));
        k.statistics.push(Statistic.factory({name: 'Horsemanship', level: 5}));
        k.statistics.push(Statistic.factory({name: 'Spear', level: 5}));
        k.armor = 'Chain Hauberk';
        k.shield = true;

        k.save(cb);
    });

    
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
