/*
 * Family model
*/
/*global export, require, module */

var Family; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Locale = require('./locale'),
    Character = require('./character'),
    Knight = require('./knight'),
    Steward = require('./steward'),
    Storyline = require('./storyline');


var FamilySchema = new Schema({
    name:           { type: String, required: true },
    holdings:       [Locale.schema],
    members:        [Character.schema],   // patriarch is always zeroeth member
    cash:           Number,
    specialty:      String,
    generosity:     Number,
    livingStandard: String,
    queuedEvents:   [Storyline.schema]
});


FamilySchema.statics.factory = function (template, settings, cb) {
    "use strict";
    var result = new Family({name: template.name,
                             specialty: template.specialty || null,
                             cash: template.cash || 0,
                             generosity: template.generosity || 0,
                             livingStandard: template.livingStandard || 'Normal'
                            }),
        firstKnight = Knight.factory({name: 'first knight',
                                         profession: 'Knight'
                                        }, true),
        firstSteward = Steward.factory({name: 'first steward',
                                          profession: 'Steward'
                                         }),
        holding = Locale.factory(template.locale);

    result.members.push(firstKnight);   // patriarch is always zeroeth member
    result.members.push(firstSteward);

    holding.addSteward(firstSteward);
    result.holdings.push(holding);

    result.generateSpecialty()
        .fatherHistory();

    if (cb) {cb(0, result); }

    return result;
};

FamilySchema.methods.fatherHistory = function () {
    "use strict";
    this.queuedEvents.push(Storyline.factory({
        name: 'Father History',
        title: 'Tragedy!',
        message: "Your father died.",
        actions: {log: true},
        choices: [{label: 'Done'}]
    }));

    return this;
};

FamilySchema.methods.generateSpecialty = function () {
    "use strict";
    // called only at family construction
    this.specialty = 'horsemanship';  // TODO
    
    return this;
};

FamilySchema.methods.mergeOptions = function (options, cb) {
    "use strict";
    var counter = 0,
        cbCalled = false;

    if (options && options.changes) {
        this.generosity = options.changes.generosity || this.generosity;
        this.livingStandard = options.changes.livingStyle || this.livingStandard;
        this.cash = options.changes.cash || this.cash;

        this.members.forEach(function (m) {
            if (options.changes[m.id]) {
                m.mergeOptions(options.changes[m.id]);
            }
        });

        this.holdings.forEach(function (h, i, a) {
            if (options.changes[h.id]) {
                counter += 1;
                h.mergeOptions(options.changes[h.id], function () {
                    counter -= 1;
                    if (0 === counter && i === (a.length - 1) && cb) {
                        cbCalled = true;
                        cb();
                    }
                });
            }
        });
        
        if (0 === counter && cb && !cbCalled) {cb(); }
    }
    
    return this;
};

FamilySchema.methods.endQuarter = function (turn) {
    "use strict";
    this.clearEvents(turn);
    
    return this;
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

FamilySchema.methods.clearEvents = function (turn) {
    "use strict";
    var index;
    
    for (index = 0; index < this.queuedEvents.length; index += 1) {
        // do not filter by satisfies for removing events
        if (this.queuedEvents[index].filterByTurn(turn)) {
            this.queuedEvents.splice(index, 1);
            index -= 1;
        }
    }

    return this;
};

FamilySchema.methods.getEvents = function (turn, result) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this;
    
    if (!result) {
        result = [];
    }
    
    this.members.forEach(function (m) {m.getEvents(turn, result); });
    this.holdings.forEach(function (h) {h.getEvents(turn, result); });

    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(turn, that.satisfies)) {
            result.push(e);
        }
    });
    
    return result;
};

FamilySchema.methods.winter = function (game, cb) {
    "use strict";
    var doneMember = this.members.length === 0,
        counterMember = 0,
        mL = this.members.length,
        doneHoldings = this.holdings.length === 0,
        counterHolding = 0,
        mH = this.holdings.length;
    
    // TODO determine pentacost court plans
    if (doneHoldings && doneMember && cb) {cb(); }
    
    //      age each character a year
    this.members.forEach(function (m) {
        m.increaseAge();
        
        counterMember += 1;
        if (cb && counterMember === mL) {
            doneMember = true;
            if (doneHoldings) {cb(); }
        }
        // TODO determine child births
    });

    //      determine holding events
    this.holdings.forEach(function (h) {
        h.determineYearEvents(function () {
            // must make sure this callback is called for every holding
            counterHolding += 1;
            if (cb && counterHolding === mH) {
                doneHoldings = true;
                if (doneMember) {cb(); }
            }
        });
        // TODO determine peasant population growth
        // TODO determine hatred fallout
    });

    return this;
};

FamilySchema.methods.spring = function (game, cb) {
    "use strict";
    cb();
    return this;
};

FamilySchema.methods.summer = function (game, cb) {
    "use strict";
    cb();
    return this;
};

FamilySchema.methods.fall = function (game, cb) {
    "use strict";
    // Activities that occur in Fall:
    //      experience checks for all family members
    this.members.forEach(function (m) {
        m.skills.forEach(function (s) {s.experienceCheck(); });
    });
        // TODO determine harvest results
        // TODO determine investment completions
        // TODO determine training results
        // TODO determine generosity results
        // TODO determine Christmas court results
        // TODO determine any marriages or daliances

    cb();
    
    return this;
};

var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
