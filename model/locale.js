/*
 * Locale model
*/
var Locale, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Investment = require('./investment'),
    Feast = require('./feast'),
    defaultObjects = require('./defaultObjects');

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    steward:        ObjectId,
    investments:    [Investment.schema],
    allowedInvests: [Investment.schema],
    allowedFeasts:  [Feast.schema],
    population:     {noncombatants: Number, militia: Number, archers: Number, karls: Number}
});


LocaleSchema.statics.factory = function (template) {
    "use strict";
    var result = new Locale({name: template.name,
                             income: template.income || 6,
                             cost: 1,
                             population: template.population ||
                             {noncombatants: 500,
                              archers: 0,
                              militia: (Math.floor(Math.random() * 20) + 1) * 5,
                              karls: Math.floor(Math.random() * 6)
                             }
                            });

    defaultObjects.investments.forEach(function (i) {
        result.allowedInvests.push(Investment.factory(i));
    });
    result.addInvestment('Manor House');
    result.addInvestment('Mill');

    defaultObjects.feasts.forEach(function (i) {
        result.allowedFeasts.push(Feast.factory(i));
    });

    return result;
};

LocaleSchema.methods.addInvestment = function (invest) {
    "use strict";
    var holding = this;
    this.allowedInvests.forEach(function (inv, i, arr) {
        if (inv.name === invest) {
            arr.splice(i, 1);
            holding.investments.push(inv);
        }
    });
};

LocaleSchema.methods.addSteward = function (s) {
    "use strict";
    if (this.steward) {this.cost -= 1; }

    if (s) {
        this.steward = s.id;
        if ('Steward' === s.profession) {this.cost += 1; }
    } else {
        delete this.steward;
    }
};

LocaleSchema.methods.mergeOptions = function (options) {
    "use strict";
};

var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
