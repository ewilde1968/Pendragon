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
    father:     ObjectId,                   // father of any babies in the womb
    husband:    ObjectId
});


LadySchema.statics.factory = function (template, game, cb) {
    "use strict";
    var result = new Lady(template);
    result.initialize(template, game);
    
    result.profession = 'Lady';

    result.age = template.age || 16;
    result.fertility = template.fertility || (this.age > 14 && this.age < 38);
    result.getStat("Body").increase(-1);
    result.getStat("Soul").increase(1);
    result.statistics.push(Statistic.factory({name: 'Honor', level: 4}));
    result.statistics.push(Statistic.factory({name: 'Stewardry', level: 5}));

    result.save(cb);

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
            Storyline.findOne({name: eventName, isTemplate: true}, function (err, ev) {
                if (err) {return err; }
                
                ev.isTemplate = false;
                if (!ev.actions) {ev.actions = {}; }
                ev.actions.target = that.id;
                ev.actions.partner = partnerId;
                ev.setFutureTime(game.turn, 0, 3);
                
                if (ev) {that.queuedEvents.push(ev); }
                if (cb) {cb(); }
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

LadySchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    switch (game.turn.quarter) {
    case "Winter":
        break;
    case "Spring":
        break;
    case "Summer":
        break;
    case "Fall":
        break;
    default:
        throw {
            name: 'Invalid quarter',
            message: 'LadySchema.doTurn, quarter ' + game.turn.quarter
        };
    }

    Character.nextTurn.apply(this, [options, game, function (cost) {
        if (cb) {cb(cost); }
    }]);
};


var Lady = mongoose.model('Lady', LadySchema);
module.exports = Lady;
