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
    Lady = require('./lady'),
    Squire = require('./squire'),
    Storyline = require('./storyline');


var FamilySchema = new Schema({
    name:           { type: String, required: true },
    holdings:       [Locale.schema],
    patriarch:      [{ type: ObjectId, ref: 'Knight' }],
    bros:           [{ type: ObjectId, ref: 'Knight' }],    // brothers and uncles of the patriarch
    ladies:         [{ type: ObjectId, ref: 'Lady' }],      // women of all stations in the close family
    extended:       [{ type: ObjectId, ref: 'Squire' }],    // nobles of other persuasions, usually trained but not fully equipped
    politics:       [{ type: ObjectId, ref: 'Family', relationship: String}],
    cash:           Number,
    specialty:      String,
    generosity:     Number,
    livingStandard: String,
    queuedEvents:   [Storyline.schema]
});


FamilySchema.statics.populateString = 'name holdings patriarch bros ladies extended politics cash specialty generosity livingStandard queuedEvents';

FamilySchema.statics.factory = function (template, settings, cb) {
    "use strict";
    var result = new Family({name: template.name,
                             specialty: template.specialty || null,
                             cash: template.cash || 0,
                             generosity: template.generosity || 0,
                             livingStandard: template.livingStandard || 'Normal'
                            }),
        firstSteward = Steward.factory({name: 'first steward',
                                          profession: 'Steward'
                                         }),
        holding = Locale.factory(template.locale),
        firstKnight = Knight.factory({name: 'first knight',
                                         profession: 'Knight'
                                        }, function () {
            result.patriarch.push(firstKnight.id);
            result.save(function (err, doc) {
                if (err) {return err; }
                if (cb) {cb(doc); }
            });
        }, true);

    holding.addSteward(firstSteward);
    result.holdings.push(holding);
    result.generateSpecialty()
        .fatherHistory();

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

FamilySchema.methods.getEvents = function (game, result, cb) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this,
        doneLadies = 0 === that.ladies.length,
        doneBros = 0 === that.bros.length,
        donePatriarch,
        doneSquires = 0 === that.extended.length,
        doneHoldings = 0 === that.holdings.length,
        complete = function () {
            if (cb && doneBros && doneHoldings && doneLadies && donePatriarch && doneSquires) {
                
                cb({
                    family: that,
                    patriarch: donePatriarch,
                    holdings: doneHoldings,
                    bros: doneBros,
                    ladies: doneLadies,
                    extended: doneSquires,
                    events: result
                });
            }
        };
    
    if (!result) {
        result = [];
    }
    
    that.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(game.turn, that.satisfies)) {
            result.push(e);
        }
    });
    
    // populate in priority of events being shown to user
    that.populate({path: 'patriarch bros', model: 'Knight', select: Knight.populateString},
                  function (err, doc) {
            var counter = 0,
                limit = doc.bros.length;

            if (err) {return err; }

            doc.patriarch[0].getEvents(game.turn, result);
            donePatriarch = doc.patriarch[0];

            doc.holdings.forEach(function (h) {h.getEvents(game.turn, result); });
            doneHoldings = doc.holdings;

            doc.bros.forEach(function (b) {
                counter += 1;
                b.getEvents(game.turn, result);
                if (counter === limit) {
                    doneBros = doc.bros;
                    complete();
                }
            });
                      
            complete();
        });

    that.populate({path: 'ladies', model: 'Lady', select: Lady.populateString},
                    function (err, doc) {
            var counter = 0,
                limit = doc.ladies.length;

            if (err) {return err; }

            doc.ladies.forEach(function (l) {
                counter += 1;
                l.getEvents(game.turn, result);
                if (counter === limit) {
                    doneLadies = doc.ladies;
                    complete();
                }
            });
        });
    
    that.populate({path: 'squires', model: 'Squire', select: Squire.populateString},
                    function (err, doc) {
            var counter = 0,
                limit = doc.extended.length;
                    
            if (err) {return err; }
                     
            doc.extended.forEach(function (s) {
                counter += 1;
                s.getEvents(game.turn, result);
                if (counter === limit) {
                    doneSquires = doc.extended;
                    complete();
                }
            });
        });

    return that;
};

FamilySchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this,
        result = [],
        totalCost = 0,
        holdingcosts = 0,
        doneLadies = 0 === that.ladies.length,
        doneBros = 0 === that.bros.length,
        donePatriarch,
        doneSquires = 0 === that.extended.length,
        doneHoldings = 0 === that.holdings.length,
        complete = function (cost) {
            totalCost += cost;
            if (doneBros && doneHoldings && doneLadies && donePatriarch && doneSquires) {
                that.cash -= totalCost;
                that.save(function (err, doc) {
                    if (cb) {
                        cb({
                            family: that,
                            patriarch: donePatriarch,
                            holdings: doneHoldings,
                            bros: doneBros,
                            ladies: doneLadies,
                            extended: doneSquires,
                            events: result
                        });
                    }
                });
            }
        },
        counter = 0,
        limit = this.holdings.length;
    
    that.clearEvents(game.turn);

    // TODO option = options || that.AIOptions(game, cb);
    if (options && options.changes) {
        that.generosity = options.changes.generosity || that.generosity;
        that.livingStandard = options.changes.livingStyle || that.livingStandard;
        that.cash = options.changes.cash || that.cash;
    }

    // populate in priority of events being shown to user
    that.populate({path: 'patriarch', model: 'Knight', select: Knight.populateString},
                  function (err, doc) {
            if (err) {return err; }

            doc.patriarch[0].nextTurn(!options || options.changes[doc.patriarch[0].id], game, result, function (cost, evs) {
                donePatriarch = doc.patriarch[0];
                complete(cost);
            });
        });

    that.holdings.forEach(function (h) {
        h.nextTurn(!options || options.changes[h.id], game, result, function (cost, evs) {
            holdingcosts += cost;
                
            counter += 1;
            if (counter === limit) {
                doneHoldings = that.holdings;
                complete(holdingcosts);
            }
        });
    });

    that.populate({path: 'bros', model: 'Knight', select: Knight.populateString},
                  function (err, doc) {
            var counter = 0,
                limit = doc.bros.length;

            if (err) {return err; }
            doc.bros.forEach(function (b) {
                b.nextTurn(!options || options.changes[b.id], game, result, function (cost, evs) {
                    totalCost += cost;
                
                    counter += 1;
                    if (counter === limit) {
                        doneBros = doc.bros;
                        complete(totalCost);
                    }
                });
            });
        });

    this.populate({path: 'ladies', model: 'Lady', select: Lady.populateString},
                    function (err, doc) {
            var counter = 0,
                limit = doc.ladies.length;

            if (err) {return err; }
            doc.ladies.forEach(function (l) {
                l.nextTurn(!options || options.changes[l.id], game, result, function (cost, evs) {
                    totalCost += cost;
                
                    counter += 1;
                    if (counter === limit) {
                        doneLadies = doc.ladies;
                        complete(totalCost);
                    }
                });
            });
        });
    
    this.populate({path: 'squires', model: 'Squire', select: Squire.populateString},
                    function (err, doc) {
            var counter = 0,
                limit = doc.extended.length;
                    
            if (err) {return err; }
            doc.extended.forEach(function (s) {
                s.nextTurn(options.changes[s.id], game, result, function (cost, evs) {
                    totalCost += cost;
                
                    counter += 1;
                    if (counter === limit) {
                        doneSquires = doc.extended;
                        complete(totalCost);
                    }
                });
            });
        });

    return this;
};



var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
