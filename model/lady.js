/*
 * Lady model
*/
/*global export, require, module */
var Lady; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Statistic = require('./statistic'),
    Character = require('./character'),
    Storyline = require('./storyline');


var LadySchema = Character.schema.extend({
    babies:     Number,                     // # babies in the womb
    father:     ObjectId                    // father of any babies in the womb
});


LadySchema.statics.factory = function (template, game, family, cb) {
    "use strict";
    var result = new Lady(template);
    
    result.initialize(template, game, family, function (l) {
        l.profession = 'Lady';

        l.age = template.age || 16;
        l.fertility = template.fertility || (result.age > 14 && result.age < 38);
        l.getStat("Body").increase(-1);
        l.getStat("Soul").increase(1);
        l.statistics.push(Statistic.factory({name: 'Honor', level: 4}));
        l.statistics.push(Statistic.factory({name: 'Stewardry', level: 5}));

        l.save(cb);
    });

    return result;
};

LadySchema.methods.increaseAge = function () {
    "use strict";
    this.prototype.increaseAge();

    if (this.age >= 38) {
        // menopause
        this.fertility = false;
    }
    
    return this;
};

LadySchema.methods.marriagable = function () {
    "use strict";
    return !this.spouse && this.fertility;
};

LadySchema.methods.dalliance = function (family, game, partnerId, cb) {
    "use strict";
    var that = this,
        bonus = 0,
        chance = Statistic.factory({level: 6}),
        complete = function (eventName, seasons) {
            Storyline.findByName(eventName, function (err, ev) {
                var act;
                
                if (err) {return err; }
                
                if (!ev.actions) {
                    act = {};
                } else if ('string' === typeof ev.actions) {
                    act = JSON.parse(ev.actions);
                } else {
                    act = ev.actions;
                }
                
                act.target = that.id;
                act.partner = partnerId;
                ev.setFutureTime(game.turn, 0, 3);

                ev.actions = JSON.stringify(act);
                if (ev) {that.queuedEvents.push(ev); }

                that.save(cb);
            });
        };
    
    if (this.fertility) {
        if ('Rich' === family.livingStandard) {bonus = 1; }
        if ('Opulent' === family.livingStandard) {bonus = 2; }
        
        if (this.age > 34) {bonus -= 1; }
        
        chance = chance.difficultyCheck(4, bonus);
        switch (chance) {
        case 'Critical Success':
            // multiples, will roll 2d2 to see how many children
            complete('Multiple Pregnancy', 3);
            break;
        case 'Success':
            // one child
            complete('Pregnancy', 3);
            break;
        case 'Fumble':
            // complication
            complete('Fatal Miscarriage', 2);
            break;
        default:
            // no children
            if (cb) {cb(); }
            break;
        }
    }
};


var Lady = mongoose.model('Lady', LadySchema);
module.exports = Lady;
