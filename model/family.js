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
    generosity:     Number,
    livingStandard: String,
    queuedEvents:   [TimelineEvent.schema]
});


FamilySchema.statics.factory = function (template, settings) {
    "use strict";
    var result = new Family({name: template.name,
                             specialty: template.specialty || null,
                             cash: template.cash || 0,
                             generosity: template.generosity || 0,
                             livingStandard: template.livingStandard || 'Normal'
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

    if (!result.specialty) {result.generateSpecialty(); }

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
        this.generosity = options.changes.generosity || this.generosity;
        this.livingStandard = options.changes.livingStyle || this.livingStandard;
        this.cash = options.changes.cash || this.cash;

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
    this.members.forEach(function (m) {
        m.getEvents(turn, result);  // null result means delete old events
    });
    
    this.holdings.forEach(function (h) {
        h.getEvents(turn, result);
    });

    var qe = this.queuedEvents,
        index,
        e;
    if (qe && qe.length > 0) {
        for (index = 0; index < qe.length; index += 1) {
            e = qe[index];
            if ((!e.year || e.year === turn.year)
                    && (!e.quarter || e.quarter === turn.quarter)
                    && holding.satisfies(e.requirements)) {
                if (!result) {
                    qe.splice(index, 1);
                    index -= 1;
                } else {
                    result.push(e);
                }
            }
        }
    }
};

var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
