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
    Character = require('./character');

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
