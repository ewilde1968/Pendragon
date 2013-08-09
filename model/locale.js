/*
 * Locale model
*/
/*global export, require, module */
var Locale; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Investment = require('./investment'),
    Feast = require('./feast'),
    Storyline = require('./storyline'),
    defaultObjects = require('./defaultObjects');

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    steward:        ObjectId,
    investments:    [Investment.schema],
    allowedInvests: [Investment.schema],
    allowedFeasts:  [Feast.schema],
    taxes:          Number,
    population:     {noncombatants: Number, militia: Number, archers: Number, karls: Number},
    train:          {militia: Number, archers: Number, karls: Number},
    hate:           Number,
    queuedEvents:   [Storyline.schema]
});


LocaleSchema.statics.factory = function (template) {
    "use strict";
    var result = new Locale({name: template.name,
                             income: template.income || 6,
                             cost: 1,
                             taxes: template.taxes || 6,
                             population: template.population ||
                             {noncombatants: 500,
                              archers: 0,
                              militia: (Math.floor(Math.random() * 20) + 1) * 5,
                              karls: Math.floor(Math.random() * 6)
                             },
                             hate: template.hate || 10
                            });

    defaultObjects.investments.forEach(function (i) {   // TODO only allow the right subset
        result.allowedInvests.push(Investment.factory(i));
    });
    result.addInvestment('Manor House', true);
    result.addInvestment('Mill', true);

    defaultObjects.feasts.forEach(function (i) {    // TODO only allow the right subset
        result.allowedFeasts.push(Feast.factory(i));
    });

    return result;
};

LocaleSchema.methods.addInvestment = function (invest, prebuilt) {
    "use strict";
    var that = this;
    this.allowedInvests.forEach(function (inv, i, arr) {
        if (inv.name === invest) {
            arr.splice(i, 1);
            inv.built = prebuilt || inv.built;
            that.investments.push(inv);
        }
    });
    
    return this;
};

LocaleSchema.methods.addSteward = function (s) {
    "use strict";
    if (this.steward) {this.cost -= 1; }

    if (s) {
        this.steward = s.id;
        if ('Steward' === s.profession) {this.cost += 1; }
    } else {
        this.steward = null;
    }
    
    return this;
};

LocaleSchema.methods.addFeast = function (f, cb) {
    "use strict";
    var qe = this.queuedEvents,
        useCB = true;

    this.allowedFeasts.forEach(function (feast) {
        if (feast.name === f.name) {
            useCB = false;
            Storyline.findOne({name: feast.name}, function (err, ev) {
                if (err) {return err; }

                qe.push(ev);

                if (cb) {cb(); }
            });
        }
    });
    
    if (useCB && cb) {cb(); }
    
    return this;
};

LocaleSchema.methods.mergeOptions = function (options, cb) {
    "use strict";
    if (options) {
        if (options.build) {
            this.addInvestment(options.build, false);
        }
        
        if (options.tax) {
            this.income = this.income - this.taxes + options.tax;
            this.taxes = options.tax;
        }
        
        if (options.train) {
            this.train = {militia: options.train.militia || 0,
                          archers: options.train.archers || 0,
                          karls: options.train.karls || 0
                         };
        }
        
        this.addFeast(options.festival, function () {
            if (cb) {cb(); }
        });
    } else if (cb) {
        cb();
    }
    
    return this;
};

LocaleSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;
};

LocaleSchema.methods.clearEvents = function (turn) {
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

LocaleSchema.methods.getEvents = function (turn, result) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this;
    
    if (!result) {
        result = [];
    }
    
    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(turn, that.satisfies)) {
            result.push(e);
        }
    });
    
    return result;
};

LocaleSchema.methods.determineYearEvents = function (cb) {
    "use strict";
    var queue = this.queuedEvents,
        counter = 0,
        limit = this.investments.length;

    this.investments.forEach(function (i) {
        i.determineYearEvents(function (ev) {
            if (ev) {queue.push(ev); }
            
            counter += 1;
            if (cb && counter === limit) {cb(); }
        });
    });
    
    if (this.investments === 0) {cb(); }
};

LocaleSchema.methods.doSeason = function (game, cb) {
    "use strict";
    switch (game.turn.quarter) {
    case "Winter":
        this.determineYearEvents(function () {
            if (cb) {cb(); }
        });
        break;
    case "Spring":
        if (cb) {cb(); }
        break;
    case "Summer":
        if (cb) {cb(); }
        break;
    case "Fall":
        if (cb) {cb(); }
        break;
    default:
        break;
    }
};


var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
