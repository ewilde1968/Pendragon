/*
 * Squire model
*/
/*global export, require, module */
var Squire; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Statistic = require('./statistic'),
    Character = require('./character');

var SquireSchema = Character.schema.extend({
});


SquireSchema.statics.factory = function (template, game, cb, firstKnight) {
    "use strict";
    var result = new Squire(template);
    result.initialize(template, game);

    result.profession = 'Squire';

    if (firstKnight) {
        result.queuedEvents.push(result.fatherHistory());
    }

    // will add to body, skills and honor when they reach 21 and achieve knighthood
    if (!template.age) {result.age = 16; }
    result.getStat("Soul").increase(-1);
    result.statistics.push(Statistic.factory({name: 'Honor', level: 4}));
    result.statistics.push(Statistic.factory({name: 'Swordsmanship', level: 1}));
    result.statistics.push(Statistic.factory({name: 'Horsemanship', level: 1}));
    result.statistics.push(Statistic.factory({name: 'Spear', level: 1}));

    result.save(cb);
    
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
