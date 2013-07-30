/*
 * Locale model
*/
var Locale, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Investment = require('./investment');

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    steward:        ObjectId,
    investments:    [Investment.schema],
    population:     {noncombatants: Number, militia: Number, archers: Number, karls: Number}
});


LocaleSchema.statics.factory = function (template) {
    "use strict";
    var result = new Locale({name: template.name,
                             income: template.income || 6,
                             cost: 1,
                             population: template.population ||
                             {noncombatants: 500,
                              militia: (Math.floor(Math.random() * 20) + 1) * 5,
                              karls: Math.floor(Math.random() * 6)
                             }
                            });

    result.investments.push(Investment.factory({name: 'Manor House', built: true}));
    
    return result;
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
