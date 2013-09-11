/*
 * Locale model
*/
/*global export, require, module, console */
var Locale; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Investment = require('./investment'),
    Feast = require('./feast'),
    Storyline = require('./storyline'),
    Character = require('./character'),
    Steward = require('./steward'),
    Statistic = require('./statistic'),
    defaultObjects = require('./defaultObjects');

var LocaleSchema = new Schema({
    name:           { type: String, required: true },
    game:           ObjectId,
    landlord:       [{ type: ObjectId, ref: 'Family' }],
    projIncome:     Number,
    harvest:       {result: String, income: Number},
    cost:           Number,
    steward:        {stats: [Steward.schema], familyRef: ObjectId},
    investments:    [Investment.schema],
    allowedInvests: [Investment.schema],
    allowedFeasts:  [Feast.schema],
    taxes:          Number,
    population:     {noncombatants: Number, militia: Number, archers: Number, karls: Number},
    train:          {militia: Number, archers: Number, karls: Number},
    hate:           [Statistic.schema],
    quest:          [Storyline.schema], //{revolt: ObjectId, royal: ObjectId, fey: ObjectId, religious: ObjectId},
    queuedEvents:   [Storyline.schema]
});


LocaleSchema.statics.factory = function (template, game, cb) {
    "use strict";
    var result = new Locale({name: template.name,
                             game: game,
                             landlord: (template.landlord && template.landlord.id) ? [template.landlord.id] : null,
                             projIncome: template.projIncome || 6,
                             cost: 1,
                             taxes: template.taxes || 6,
                             population: template.population ||
                             {noncombatants: 500,
                              archers: 0,
                              militia: (Math.floor(Math.random() * 20) + 1) * 5,
                              karls: Math.floor(Math.random() * 6)
                             },
                             hate: Statistic.factory({level: template.hate || 0})
                            });

    defaultObjects.investments.forEach(function (i) {   // TODO only allow the right subset
        result.allowedInvests.push(Investment.factory(i));
    });
    result.addInvestment('Manor House', true);
    result.addInvestment('Mill', true);

    defaultObjects.feasts.forEach(function (i) {    // TODO only allow the right subset
        result.allowedFeasts.push(Feast.factory(i));
    });

    Steward.factory({name: 'first steward'}, game, template.landlord, function (s) {
        result.addSteward(s, function () {
            result.save(cb);
        });
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
    
    console.log("Locale events for %s:", that.name);
    
    this.queuedEvents.forEach(function (e) {
        var actions;
        
        if (e.filterByTurn(turn, that.satisfies)) {
            if (e.actions) {
                actions = JSON.parse(e.actions);
                if ('Locale' === actions.target) {
                    actions.target = that.id;
                }
                e.actions = JSON.stringify(actions);
            }

            console.log('Event: %s', e.name);
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

LocaleSchema.methods.addSteward = function (s, cb) {
    "use strict";
    var that = this;
    
    if (this.steward.stats.length > 0 && !this.steward.familyRef) {
        // if familyRef is not valid then this is a commoner steward and was paid
        this.cost -= 1;
        this.steward.stats.pop();
    }

    if (s instanceof Steward) {
        // commoner steward
        this.steward.stats.push(s);
        this.steward.familyRef = null;
        this.cost += 1;
        
        if (cb) {cb(that); }
    } else if (s && s.id) {
        // family member, which doesn't need to be paid

        Steward.factory(s, null, {id: that.landlord}, function (st) {
            that.steward.stats.push(st);   // make a Steward copy of the family member
            that.steward.familyRef = s.id;
            
            if (cb) {cb(that); }
        });
    }
    
    return this;
};

LocaleSchema.methods.addFeast = function (f, cb) {
    "use strict";
    var that = this,
        qe = this.queuedEvents,
        useCB = true;

    this.allowedFeasts.forEach(function (feast) {
        if (feast.name === f.name) {
            useCB = false;
            Storyline.findByName(feast.name, function (err, ev) {
                if (err) {return err; }

                if (ev) {
                    qe.push(ev);
                }

                if (cb) {cb(feast.cost); }
            });
        }
    });
    
    if (useCB && cb) {cb(); }
    
    return this;
};

LocaleSchema.methods.changeHate = function (hate, cb) {
    "use strict";
    var that = this;
    
    this.hate[0].increase(hate);

    // check for hate-filled peasant 'quest' against the landlord
    // only check when hate changes
    if (!this.quest && 'Critical Success' === this.hate[0].difficultyCheck(3)) {
        Storyline.findByName('revolt', function (err, qA) {
            if (err) {return err; }

            qA.forEach(function (q) {
                if (!that.quest && that.satisfies(q.requirements)) {
                    that.quest = q;
                    that.queuedEvents.push(q);
                }
            });
                
            if (cb) {cb(0); }
        });
    } else {
        if (cb) {cb(0); }
    }
    
    return this;
};

LocaleSchema.methods.growPopulations = function (amount, cb) {
    "use strict";
    var that = this;
    
    this.population.noncombatants += Math.floor(amount);
    
    if (!this.quest && (Math.floor(Math.random() * 200) + this.population.noncombatants) >= 1000) {
        Storyline.findByName('population', function (err, qA) {
            if (err) {return err; }

            qA.forEach(function (q) {
                if (!that.quest && that.satisfies(q.requirements)) {
                    that.quest = q;
                    that.queuedEvents.push(q);
                }
            });

            if (cb) {cb(0); }
        });
    } else {
        if (cb) {cb(0); }
    }
    
    return this;
};

LocaleSchema.methods.changeQuest = function (quest, cb) {
    "use strict";
    var that = this;
    
};

LocaleSchema.methods.mergeOptions = function (options, cb) {
    "use strict";
    var useCB = true,
        totalCost = 0,
        doneMain = false,
        doneFeast = !options || !options.festival,
        doneHate = !options || !options.hate,
        doneQuest = !options || !options.quest,
        complete = function () {
            if (doneHate && doneFeast && doneMain && doneQuest && cb) {cb(totalCost); }
        };

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
        
        if (options.hate) {
            this.changeHate(options.hate, function (cost) {
                totalCost += cost;
                doneHate = true;
                complete();
            });
        }
        
        if (options.festival) {
            this.addFeast(options.festival, function (cost) {
                totalCost += cost;
                doneFeast = true;
                complete();
            });
        }
        
        if (options.quest) {
            this.changeQuest(options.quest, function (cost) {
                totalCost += cost;
                doneQuest = true;
                complete();
            });
            this.quest = options.quest || this.quest;
        }
    }

    doneMain = true;
    complete();
    
    return this;
};

LocaleSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;
};

LocaleSchema.methods.determineYearEvents = function (cb) {
    "use strict";
    var that = this,
        queue = this.queuedEvents,
        counter = 0,
        limit = this.investments.length;

    this.investments.forEach(function (i) {
        i.determineYearEvents(function (ev) {
            if (ev) {
                console.log('Pushing event for locale %s: ', that.name, ev.name);
                queue.push(ev);
            }
            
            counter += 1;
            if (cb && counter === limit) {cb(); }
        });
    });
    
    if (this.investments === 0) {cb(); }
};

LocaleSchema.methods.stewardCheck = function () {
    "use strict";
    var that = this,
        d3 = function () {return Math.floor(Math.random() * 3); },
        stewardry = that.steward.stats.length > 0 ? that.steward.stats[0].getStat('Stewardry') : null,
        check = stewardry ? stewardry.opposedCheck(d3() + d3() + d3(), 0, that.hate[0].level) : 'Fumble';
    
    return check;
};

LocaleSchema.methods.calculateHarvest = function (cb) {
    "use strict";
    var that = this,
        check = that.stewardCheck(),
        popGrowth = 0,
        // 750 noncombatants would fully support a normal manor home with thier taxes and remain content
        hateChange = (this.taxes - 6) / (this.population.noncombatants / 750),
        result;

    switch (check) {
    case 'Critical Success':
        result = this.taxes * 2;
        popGrowth = this.population.noncombatants / 25 + Math.floor(Math.random() * 20);
        break;
    case 'Success':
        result = this.taxes;
        popGrowth = this.population.noncombatants / 50 + Math.floor(Math.random() * 10);
        break;
    case 'Tie':
        result = Math.floor(this.taxes * 0.75);
        popGrowth = this.population.noncombatants / 50 + Math.floor(Math.random() * 5);
        break;
    case 'Failure':
        result = Math.floor(that.taxes / 2);
        popGrowth = Math.floor(Math.random() * 10);
        break;
    case 'Fumble':
        result = Math.floor(that.taxes / 4);
        popGrowth = -this.population.noncombatants / 50 - Math.floor(Math.random() * 10);
        break;
    default:
        throw {
            name: 'Invalid harvest check',
            message: check
        };
    }
    
    that.harvest = {result: check, income: result};
    that.growPopulations(popGrowth, function () {
        that.changeHate(hateChange, function () {
            if (cb) {cb(check); }
        });
    });

    return this;
};

LocaleSchema.methods.performTraining = function () {
    "use strict";
    var that = this,
        cost = 0,
        calc;
    
    // Can train any militiaman to be an archer
    // up to 1/3 of existing militia force per year, 1 lb per archer
    if (this.train.archers > 0) {
        calc = Math.floor(this.population.militia / 3);
        calc = this.train.archers > calc ? calc : this.train.archers;
        this.population.archers += calc;
        this.population.militia -= calc;
        
        cost += this.train.archers;
    }

    // A locale can support up to 1 militiaman (or archer) per 10 noncombatants
    // 2 lbs will train and equip up to 50 militiamen
    if (this.train.militia > 0) {
        calc = Math.floor((this.population.noncombatants - this.population.archers) / 11 - this.population.militia);
        if (2 === this.train.militia) {
            calc = calc > 50 ? 50 : calc;
        } else {
            calc = calc > 25 ? 25 : calc;
        }
        this.population.militia += calc;
        this.population.noncombatants -= calc;
        
        cost += this.train.militia;
    }

    // A locale can support up to 1 karl per 100 noncombatants, though it is possible
    // to generate a locale with more karls at start
    // 10 lbs will train and equip 1 karl
    if (this.train.karls > 0) {
        calc = Math.floor(Math.max(this.population.noncombatants / 100, this.train.karls / 10));
        calc = calc > this.population.militia ? this.population.militia : calc;
        this.population.karls += calc;
        this.population.militia -= calc;
        
        cost += this.train.karls;
    }
    
    return cost;
};

LocaleSchema.methods.calculateProjectedIncome = function () {
    "use strict";
    var proj = this.taxes;

    this.investments.forEach(function (i) {
        if (i.built && !i.damaged && i.income) {proj += i.income; }
    });
    
    this.projIncome = proj;
    
    return this;
};

LocaleSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    var that = this,
        totalCost = 0,
        complete = function () {
            // update projected income every turn
            that.calculateProjectedIncome();
            
            that.save(function (err) {
                if (err) {return err; }
                if (cb) {cb(totalCost); }
            });
        };

    console.log('Next Turn for locale %s', that.name);
    
    that.clearEvents(game.turn);
    that.mergeOptions(options, function (cost) {
        totalCost += cost;
        
        switch (game.turn.quarter) {
        case "Winter":
            // TODO determine peasant population growth
            // TODO determine hatred fallout
            // determine holding events
            if (that.landlord === game.playerFamily) {
                that.determineYearEvents(function () {
                    complete();
                });
            } else {complete(); }
            break;
        case "Spring":
            complete();
            break;
        case "Summer":
            // determine training results
            totalCost += that.performTraining();
            complete();
            break;
        case "Fall":
            // determine harvest results
            that.calculateHarvest(function (stewardry) {
                totalCost += that.cost;
                
                that.investments.forEach(function (i) {
                    // determine this year's investment income
                    if (i.built && !i.damaged && i.income) {
                        that.harvest.income += i.harvest(that.stewardCheck());
                    }
                    // determine investment completions
                    if (!i.built) {
                        i.built = true;
                        that.cost += i.maintenance;
                    }
                });

                console.log("Harvest for %s: %d", that.name, that.harvest.income);

                totalCost -= that.harvest.income;
                complete();
            });
            break;
        default:
            break;
        }
    });
};


var Locale = mongoose.model('Locale', LocaleSchema);
module.exports = Locale;
