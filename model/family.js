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
    if (options && options.changes) {
        if (options.changes.generosity || options.changes.livingStyle) {
            this.members[0].setPersonalExpenses(options.changes);
        }

        this.members.forEach(function (m) {
            if (options.changes[m.id]) {
                m.mergeOptions(options.changes[m.id]);
            }
        });

        this.holdings.forEach(function (h) {
            if (options.changes[h.id]) {
                h.mergeOptions(options.changes[h.id]);
            }
        });
    }
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

    this.members.forEach(function (m) {
        m.getEvents(turn, result);
    });

    var qe = this.queuedEvents;
    if (qe && qe.length > 0) {
        qe.forEach(function (e, i, a) {
            if (e.year === turn.year && e.quarter === turn.quarter
                    && this.satisfies(e.requirements)) {
                result.push(e);
                a.splice(i, 1);
            }
        });
    }
};

var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
