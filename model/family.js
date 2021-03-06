/*
 * Family model
*/
/*global export, require, module, console */

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
    Storyline = require('./storyline'),
    Politics = require('./politics');


var FamilySchema = new Schema({
    name:           { type: String, required: true },
    game:           ObjectId,
    patriarch:      ObjectId,   // Knight
    liege:          ObjectId,   // Family
    king:           ObjectId,   // Family
    rank:           String,
    politics:       [Politics.schema],                      // references to other families
    cash:           Number,
    specialty:      String,
    generosity:     Number,
    livingStandard: String,
    queuedEvents:   [Storyline.schema]
});

// in order to avoid 1:many querries
//      Locales held by the family are queried via owner of locale
//      Knights sworn fealty to the patriarch are queried via liege

FamilySchema.statics.factory = function (template, settings, cb) {
    "use strict";
    var result = new Family({name: template.name,
                             game: template.game,
                             specialty: template.specialty || null,
                             rank: template.rank || 'Knight Bachelor',
                             cash: template.cash || 0,
                             generosity: template.generosity || 0,
                             livingStandard: template.livingStandard || 'Normal'
                            }),
        donePatriarch = template.patriarch === false,
        doneLocale = !template.locale,
        doneLiege = !template.liege,
        countExtended = template.extended ? template.extended.length : 0,
        countLadies = template.ladies ? template.ladies.length : 0,
        stewardLady,
        complete = function () {
            if (0 === countLadies && 0 === countExtended && donePatriarch && doneLiege && doneLocale) {
                if (stewardLady && doneLocale.steward && !doneLocale.steward.familyRef) {
                    doneLocale.addSteward(stewardLady, function () {
                        doneLocale.save();
                    });
                }
                
                result.save(function (err, doc) {
                    if (err) {return err; }
                    if (cb) {cb(doc); }
                });
            }
        };

    result.generateSpecialty()
        .fatherHistory();

    if (template.patriarch !== false) {
        Knight.factory({name: template.patriarch || 'first knight',
                        profession: 'Knight'
                    }, template.game, result,
                   function (err, firstKnight) {
                if (err) {return err; }

                result.patriarch = firstKnight.id;
                donePatriarch = true;
                complete();
            }, true);
    }
    
    if (template.locale) {
        template.locale.landlord = result;
        Locale.factory(template.locale, template.game, function (err, locale) {
            doneLocale = locale;
            complete();
        });
    }
    
    if (template.liege && typeof template.liege === 'string') {
        Family.findOne({game: template.game, name: template.liege}, function (err, doc) {
            if (err) {return err; }
            if (doc) {result.liege = doc.id; }
            
            doneLiege = true;
            complete();
        });
    } else {
        result.leige = template.liege;
        doneLiege = true;
    }
    
    if (template.extended) {
        template.extended.forEach(function (ex) {
            Squire.factory(ex, template.game, result, function (err, s) {
                if (err) {return err; }
                
                countExtended -= 1;
                complete();
            });
        });
    }
    
    if (template.ladies) {
        template.ladies.forEach(function (l) {
            Lady.factory(l, template.game, result, function (err, lady) {
                if (err) {return err; }
                
                // find the lady with the highest stewardry to take care of the holding
                if (!stewardLady || stewardLady.getStat('Stewardry').level > lady.getStat('Stewardry').level) {
                    stewardLady = lady;
                }
                
                countLadies -= 1;
                complete();
            });
        });
    }
    
    complete();

    return result;
};

FamilySchema.methods.fatherHistory = function () {
    "use strict";
    var that = this;
    
    this.queuedEvents.push(Storyline.factory({
        name: 'Father History',
        target: that.id,
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

FamilySchema.methods.changeRelationship = function (family, newRelationship) {
    "use strict";
    var that = this,
        found = false;

    that.politics.forEach(function (p) {
        if (family.id === p.family) {
            found = p;
        }
    });
                      
    if (!found) {
        found = Politics.factory({family: family.id});
        that.politics.push(found);
        found.changeRelationship(newRelationship);
    }

    return this;
};

FamilySchema.methods.getEvents = function (game, result, cb) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this,
        donePatriarch,
        doneHoldings = false,
        doneExtended = false,
        doneLadies = false,
        complete = function () {
            if (doneExtended && doneLadies && cb && doneHoldings && donePatriarch) {
                cb({
                    family: that,
                    patriarch: donePatriarch,
                    holdings: doneHoldings,
                    events: result
                });
            }
        };
    
    if (!result) {
        result = [];
    }
    
    console.log("Family events for %s:", that.name);
    
    // populate in priority of events being shown to user

    that.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(game.turn, that.satisfies)) {
            console.log('Event: %s', e.name);
            result.push(e);
        }
    });

    Knight.findById(that.patriarch, function (err, patriarch) {
        if (err) {return err; }

        patriarch.getEvents(game.turn, result);
        donePatriarch = patriarch;
        complete();
    });

    Locale.find({landlord: that.id}, function (err, holdings) {
        var counter = 0,
            limit = holdings.length;

        if (err) {return err; }
        if (limit === 0) {
            doneHoldings = holdings;
            complete();
        }

        holdings.forEach(function (h) {
            counter += 1;
            h.getEvents(game.turn, result);
            if (counter === limit) {
                doneHoldings = holdings;
                complete();
            }
        });
    });
    
    Squire.find({family: that.id}, function (err, extended) {
        var counter = 0,
            limit = extended.length,
            endList = [];

        if (err) {return err; }
        if (limit === 0) {
            doneExtended = extended;
            complete();
        }

        extended.forEach(function (e) {
            counter += 1;
            
            if ('Squire' === e.profession) {
                endList.push(e);
                e.getEvents(game.turn, result);
            }
            
            if (counter === limit) {
                doneExtended = endList;
                complete();
            }
        });
    });

    Lady.find({family: that.id}, function (err, ladies) {
        var counter = 0,
            limit = ladies.length,
            endList = [];

        if (err) {return err; }
        if (limit === 0) {
            doneLadies = ladies;
            complete();
        }

        ladies.forEach(function (l) {
            counter += 1;
            
            if ('Lady' === l.profession) {
                endList.push(l);
                l.getEvents(game.turn, result);
            }
            
            if (counter === limit) {
                doneLadies = endList;
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
        totalCost = 0,
        donePatriarch,
        doneHoldings = false,
        complete = function (cost) {
            totalCost += cost;
            if (doneHoldings && donePatriarch) {
                that.cash -= totalCost;
                that.save(function (err, doc) {
                    if (cb) {cb(); }
                });
            }
        };
    
    console.log('Next Turn for family %s', that.name);
    
    that.clearEvents(game.turn);

    if (options && options.changes) {
        that.generosity = options.changes.generosity || that.generosity;
        that.livingStandard = options.changes.livingStyle || that.livingStandard;
        that.cash = options.changes.cash || that.cash;
    }

    // populate in priority of events being shown to user
    Knight.findById(that.patriarch, function (err, patriarch) {
        if (err) {return err; }
        
        if (!patriarch) {
            donePatriarch = true;
            complete(0);
        } else {
            patriarch.nextTurn(options && options.changes[patriarch.id], game, function (cost) {
                donePatriarch = true;
                complete(cost);
            });
        }
    });
    
    Locale.find({landlord: that.id}, function (err, holdings) {
        var counter = 0,
            limit = holdings.length,
            groupCost = 0;

        if (err) {return err; }
        if (limit === 0) {
            doneHoldings = holdings;
            complete(0);
        }

        holdings.forEach(function (h) {
            h.nextTurn(options && options.changes[h.id], game, function (cost) {
                groupCost += cost;
                
                counter += 1;
                if (counter === limit) {
                    doneHoldings = true;
                    complete(groupCost);
                }
            });
        });
    });

    return this;
};

FamilySchema.methods.findKing = function (cb) {
    "use strict";
    var that = this;
    
    if (that.king) {
        cb(that.king);
    } else {
        if ("King" === that.rank || "Emporer" === that.rank) {
            that.king = that.id;
            cb(that.id);
        } else {
            Family.findById(that.liege, function (err, l) {
                if (err) {return err; }
                
                if (l) {l.findKing(cb); } else if (cb) {cb(); }
            });
        }
    }
};


var Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
