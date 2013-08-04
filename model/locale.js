/*
 * Locale model
*/
var Locale, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Investment = require('./investment'),
    Feast = require('./feast'),
    TimelineEvent = require('./timelineevent'),
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
    queuedEvents:   [TimelineEvent.schema]
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

LocaleSchema.methods.addFeast = function (f) {
    "use strict";
    var that = this;
    this.allowedFeasts.forEach(function (feast) {
        if (feast.name === f.name) {
            var ev = TimelineEvent.factory({
                    quarter: feast.season,
                    title: feast.name + ' at ' + that.name,
                    message: feast.message || '',
                    results: feast.results || [{label: 'Done', action: 'log'}]
                }, that.queuedEvents);
            that.queuedEvents.push(ev);
        }
    });
    
    return this;
};

LocaleSchema.methods.mergeOptions = function (options) {
    "use strict";
    if (options) {
        if (options.build) {
            this.addInvestment(options.build.name, false);
        }
        
        if (options.tax) {
            this.income = this.income - this.taxes + options.tax;
            this.taxes = options.tax;
        }
        
        if (options.festival) {
            this.addFeast(options.festival);
        }
        
        if (options.train) {
            this.train = {militia: options.train.militia || 0,
                          archers: options.train.archers || 0,
                          karls: options.train.karls || 0
                         };
        }
    }
    
    return this;
};

LocaleSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;
};

LocaleSchema.methods.getEvents = function (turn, result) {
    "use strict";
    var index,
        e;

    if (this.queuedEvents && this.queuedEvents.length > 0) {
        for (index = 0; index < this.queuedEvents.length; index += 1) {
            e = this.queuedEvents[index];
            if ((!e.year || e.year === turn.year)
                    && (!e.quarter || e.quarter === turn.quarter)
                    && this.satisfies(e.requirements)) {
                if (!result) {
                    this.queuedEvents.splice(index, 1);
                    index -= 1;
                } else {
                    result.push(e);
                }
            }
        }
    }
    
    return this;
};


var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
