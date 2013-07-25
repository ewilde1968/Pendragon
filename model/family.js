/*
 * Family model
*/
var Family, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Locale = require('./locale'),
    Character = require('./character'),
    TimelineEvent = require('./timelineevent');


var FamilySchema = new Schema({
    name:           { type: String, required: true },
    holdings:       [Locale.schema],
    members:        [Character.schema],   // patriarch is always zeroeth member
    cash:           Number,
    specialty:      String,
    queuedEvents:   [TimelineEvent.schema]
});


FamilySchema.statics.factory = function (template, settings) {
    "use strict";
    var result = new Family({name: template.name,
                             cash: 0
                            }),
        firstKnight = Character.factory({name: 'first knight',
                                         profession: 'Knight'
                                        }, true),
        firstSteward = Character.factory({name: 'first steward',
                                          profession: 'Steward'
                                         }),
        holding = Locale.factory(template.locale);

    result.members.push(firstKnight);   // patriarch is always zeroeth member
    result.members.push(firstSteward);

    holding.addSteward(firstSteward);
    result.holdings.push(holding);

    result.generateSpecialty();

    return result;
};

FamilySchema.methods.generateSpecialty = function () {
    "use strict";
    // called only at family construction
    this.specialty = 'horsemanship';  // TODO
};

FamilySchema.methods.mergeOptions = function (options) {
    "use strict";
};

FamilySchema.methods.endQuarter = function () {
    "use strict";
};

FamilySchema.methods.resources = function () {
    "use strict";
    return 6;   // TODO
};

FamilySchema.methods.getMember = function (id) {
    "use strict";
    return this.members.id(id);
};

FamilySchema.methods.getHolding = function (id) {
    "use strict";
    return this.holdings.id(id);
};

FamilySchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

FamilySchema.methods.getEvents = function (turn, result) {
    "use strict";
    if (!result) {result = []; }

    var qe = this.queuedEvents[turn.year];
    if (qe && qe.length > 0) {
        qe.forEach(function (e, i, a) {
            if (e.quarter === turn.quarter && this.satisfies(e.requirements)) {
                result.push(e);
                a.splice(i, 1);
            }
        });
    }

    this.members.forEach(function (m) {
        m.getEvents(turn, result);
    });
};

var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
