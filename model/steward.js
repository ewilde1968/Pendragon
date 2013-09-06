/*
 * Steward model
 *
 * All steward class characters are commoners, generally hired to be the
 * steward for a family holding.
 *
*/
/*global export, require, module */
var Steward; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Statistic = require('./statistic'),
    Character = require('./character');

var StewardSchema = Character.schema.extend({
});


StewardSchema.statics.factory = function (template, game, family, cb) {
    "use strict";
    var result = new Steward(template);
    result.initialize(template, game, family, function (s) {
        s.profession = 'Steward';

        if (!template.age) {s.age = 21; }
        s.statistics.push(Statistic.factory({name: 'Honor', level: 4}));
        s.statistics.push(Statistic.factory({name: 'Stewardry', level: 5}));
        s.statistics.push(Statistic.factory({name: 'Swordsmanship', level: 1}));
        s.statistics.push(Statistic.factory({name: 'Horsemanship', level: 1}));
        s.statistics.push(Statistic.factory({name: 'Spear', level: 1}));
        
        if (cb) {cb(s); }
    });

    return result;
};


var Steward = mongoose.model('Steward', StewardSchema);
module.exports = Steward;
