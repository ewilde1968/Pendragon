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
    Character = require('./character'),
    Steward = require('./steward'),
    Skill = require('./skill'),
    defaultObjects = require('./defaultObjects');

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    projIncome:     Number,
    harvests:       [{result: String, income: Number}],     // keep 5 years of harvest records for population growth
    cost:           Number,
    steward:        {stats: [Steward.schema], familyRef: ObjectId},
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
                             projIncome: template.projIncome || 6,
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

LocaleSchema.methods.getEvents = function (turn, evs) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this;
    
    if (!evs) {
        evs = [];
    }
    
    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(turn, that.satisfies)) {
            evs.push(e);
        }
    });
    
    return evs;
};

LocaleSchema.methods.addInvestment = function (invest, prebuilt) {
    "use strict";
    var that = this,
        cost = 0;

    this.allowedInvests.forEach(function (inv, i, arr) {
        if (inv.name === invest) {
            arr.splice(i, 1);
            inv.built = prebuilt || inv.built;
            that.investments.push(inv);
            cost = inv.cost;
        }
    });
    
    return cost;
};

LocaleSchema.methods.addSteward = function (s) {
    "use strict";
    if (this.steward.stats.length > 0 && !this.steward.familyRef) {
        // if familyRef is not valid then this is a commoner steward and was paid
        this.cost -= 1;
    }
    this.steward.stats.pop();

    if (s instanceof Steward) {
        // commoner steward
        this.steward.stats.push(s);
        this.steward.family = null;
        this.cost += 1;
    } else if (s && s.id) {
        // family member, which doesn't need to be paid
        this.steward.stats.push(Steward.factory(s));   // make a Steward copy of the family member
        this.steward.family = s.id;
    }
    
    return this;
};

LocaleSchema.methods.addFeast = function (f, evs, cb) {
    "use strict";
    var qe = this.queuedEvents,
        useCB = true;

    this.allowedFeasts.forEach(function (feast) {
        if (feast.name === f.name) {
            useCB = false;
            Storyline.findOne({name: feast.name}, function (err, ev) {
                if (err) {return err; }

                if (ev) {
                    qe.push(ev);
                    evs.push(ev);
                }

                if (cb) {cb(feast.cost); }
            });
        }
    });
    
    if (useCB && cb) {cb(); }
    
    return this;
};

LocaleSchema.methods.mergeOptions = function (options, evs, cb) {
    "use strict";
    var useCB = true,
        totalCost = 0;

    if (options) {
        if (options.build) {
            totalCost += this.addInvestment(options.build.name, false);
        }
        
        if (options.tax) {
            this.taxes = options.tax;
        }
        
        if (options.train) {
            this.train = {militia: options.train.militia || 0,
                          archers: options.train.archers || 0,
                          karls: options.train.karls || 0
                         };
        }
        
        if (options.festival) {
            useCB = false;
            this.addFeast(options.festival, evs, function (cost) {
                totalCost += cost;
                if (cb) {cb(totalCost, evs); }
            });
        }
    }
    
    if (useCB && cb) {
        cb(totalCost, evs);
    }
    
    return this;
};

LocaleSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;
};

LocaleSchema.methods.determineYearEvents = function (evs, cb) {
    "use strict";
    var queue = this.queuedEvents,
        counter = 0,
        limit = this.investments.length;

    this.investments.forEach(function (i) {
        i.determineYearEvents(function (ev) {
            if (ev) {
                queue.push(ev);
                evs.push(ev);
            }
            
            counter += 1;
            if (cb && counter === limit) {cb(evs); }
        });
    });
    
    if (this.investments === 0) {cb(); }
};

LocaleSchema.methods.calculateHarvest = function (cb) {
    "use strict";
    var that = this,
        d3 = function () {return Math.floor(Math.random() * 3); },
        d2 = function () {return Math.floor(Math.random() * 2); },
        stewardry = that.steward.stats.length > 0 ? that.steward.stats[0].getSkill('Stewardry') : null,
        weather = Skill.factory({name: 'Weather', level: d3() + d3() + d2()}),
        check = stewardry ? stewardry.opposed(weather) : 'Fumble',
        result;

    switch (check) {
    case 'Critical Success':
        result = this.taxes * 2;
        break;
    case 'Success':
        result = this.taxes;
        break;
    case 'Failure':
        result = Math.floor(that.taxes / 2);
        break;
    case 'Fumble':
        result = Math.floor(that.taxes / 4);
        break;
    default:
        throw {
            name: 'Invalid harvest check',
            message: check
        };
    }
    
    if (that.harvests.length >= 5) {
        that.harvests.pop();    // throw away harvest results after five years
    }
    that.harvests.unshift({result: check, income: result - that.cost});
            
    if (cb) {cb(stewardry); }

    return this;
};

LocaleSchema.methods.nextTurn = function (options, game, evs, cb) {
    "use strict";
    var that = this,
        totalCost = 0;

    that.clearEvents(game.turn);
    that.mergeOptions(options, evs, function (cost) {
        totalCost += cost;
    
        switch (game.turn.quarter) {
        case "Winter":
            // TODO determine peasant population growth
            // TODO determine hatred fallout
            // determine holding events
            that.determineYearEvents(evs, function () {
                that.save(function (err, doc) {
                    if (cb) {cb(totalCost, that.getEvents(game.turn, evs)); }
                });
            });
            break;
        case "Spring":
            that.save(function (err, doc) {
                if (cb) {cb(totalCost, that.getEvents(game.turn, evs)); }
            });
            break;
        case "Summer":
            that.save(function (err, doc) {
                if (cb) {cb(totalCost, that.getEvents(game.turn, evs)); }
            });
            break;
        case "Fall":
            // determine harvest results
            that.calculateHarvest(function (stewardry) {
                that.projIncome = that.taxes;
                that.investments.forEach(function (i) {
                    // determine this year's investment income
                    if (i.built && !i.damaged && i.income) {
                        that.harvests[0].income += i.harvest(stewardry);
                    }
                    // determine investment completions
                    if (!i.built) {
                        i.built = true;
                        that.cost += i.maintenance;
                    }

                    // determine next year's projected income
                    if (i.built && !i.damaged && i.income) {
                        that.projIncome += i.income;
                    }
                });

                // TODO determine training results
                totalCost += that.cost - that.harvests[0];
                if (cb) {cb(totalCost, that.getEvents(game.turn, evs)); }
            });
            break;
        default:
            break;
        }
    });
    
    // saved above, do not edit object below switch statement
};


var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
