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
    Character = require('./character'),
    Storyline = require('./storyline');

var SquireSchema = Character.schema.extend({
});


SquireSchema.statics.factory = function (template, game, family, cb, firstKnight) {
    "use strict";
    var result = new Squire(template);
    result.initialize(template, game, family, function (s) {
        s.profession = 'Squire';

        if (firstKnight) {
            s.queuedEvents.push(s.fatherHistory());
        }

        // will add to body, skills and honor when they reach 21 and achieve knighthood
        if (!template.age) {s.age = 16; }
        s.getStat("Soul").increase(-1);
        s.statistics.push(Statistic.factory({name: 'Honor', level: 4}));
        s.statistics.push(Statistic.factory({name: 'Swordsmanship', level: 1}));
        s.statistics.push(Statistic.factory({name: 'Horsemanship', level: 1}));
        s.statistics.push(Statistic.factory({name: 'Spear', level: 1}));

        s.save(cb);
    });
    
    return result;
};

SquireSchema.methods.increaseAge = function (trained) {
    "use strict";
    this.prototype.increaseAge();

    if (trained && this.age < 21) {
        this.getStat('Swordsmanship').experience = true;
        this.getStat('Horesmanship').experience = true;
        this.getStat('Spear').experience = true;
    }
    
    return this;
};

SquireSchema.methods.dalliance = function (family, game, partnerId, cb) {
    "use strict";
    var that = this,
        bonus = 0,
        chance = Statistic.factory({level: 6}),
        complete = function (eventName, seasons) {
            Storyline.findByName(eventName, function (err, ev) {
                if (err) {return err; }

                if (!ev.actions) {ev.actions = {}; }
                ev.actions.target = that.id;
                ev.actions.partner = partnerId;
                ev.setFutureTime(game.turn, 0, 3);
                
                if (ev) {that.queuedEvents.push(ev); }
                
                that.save(cb);
            });
        };
    
    if (this.fertility) {
        chance = chance.difficultyCheck(4, bonus);
        switch (chance) {
        case 'Critical Success':
            // definitely a boy
            complete('Fathered Bastard', 3);
            break;
        case 'Success':
            // one child
            if (0 === Math.floor(Math.random() * 2)) {
                complete('Fathered Bastard', 3);
            } else if (cb) {
                cb();
            }
            break;
        default:
            // no children
            if (cb) {cb(); }
            break;
        }
    }
};


var Squire = mongoose.model('Squire', SquireSchema);
module.exports = Squire;
