/*
 * Lady model
*/
/*global export, require, module */
var Lady; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var LadySchema = Character.schema.extend({
    babies:     Number,                     // # babies in the womb
    father:     ObjectId,                   // father of any babies in the womb
    husband:    ObjectId
});


LadySchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Lady(template);
    result.initialize(template);

    return result;
};

LadySchema.methods.initialize = function (template) {
    "use strict";
    this.prototype.initialize(template);
    
    this.profession = 'Lady';

    this.age = template.age || 16;
    this.fertility = template.fertility || (this.age > 14 && this.age < 38);
    this.soul += 1;
    this.body -= 1;
    this.honor = 4;
    this.skills.push(Skill.factory({name: 'Stewardry', level: 3}));

    return this;
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

LadySchema.methods.nextTurn = function (options, game, evs, cb) {
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

    Character.nextTurn.apply(this, [options, game, evs, function (evs, cost) {
        if (cb) {cb(cost, evs); }
    }]);
};


var Lady = mongoose.model('Lady', LadySchema);
module.exports = Lady;
