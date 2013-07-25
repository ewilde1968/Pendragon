/*
 * Locale model
*/
var Locale, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    steward:        ObjectId
});


LocaleSchema.statics.factory = function (template) {
    "use strict";
    var result = new Locale({name: template.name,
                             income: template.income || 6,
                             cost: 1
                            });

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

var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
