/*
 * Game model
*/
/*global export, require, module, console */

var Game; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Family = require('./family'),
    Storyline = require('./storyline'),
    Court = require('./court');

var GameSchema = new Schema({
    owner:          { type: ObjectId, required: true },
    playerFamily:   ObjectId,
    settings:       Object,
    turn:           { year: Number, quarter: String },
    court:          ObjectId,
    queuedEvents:   [Storyline.schema]
});

// in order to avoid 1:many querries
//      Families of game are queried via game of the family


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var that = this,
        doneFamilies = false,
        doneS = false,
        result = new Game({owner: ownerId,
                           settings: settings,
                           turn: {year: 485, quarter: "Winter"}
                          }),
        complete = function () {
            if (doneFamilies && doneS) {
                result.save(cb);
            }
        },
        createFamilies = function (list, match, cb) {
            var counter = 0,
                limit = list.length;
            
            if (limit > 0) {
                list.forEach(function (template) {
                    template.game = result.id;

                    Family.factory(template, settings, function (f) {
                        counter += 1;
                    
                        if (match === template.name) {result.playerFamily = f.id; }
                        if (counter >= limit) {cb(); }
                    });
                });
            } else if (cb) {cb(); }
        };
            

    Storyline.find({year: result.turn.year,
                    quarter: result.turn.quarter,
                    isTemplate: true
                   }, function (err, evs) {
        if (err) {return err; }
                       
        evs.forEach(function (e) {
            e.isTemplate = false;
            result.queuedEvents.push(e);
        });
        
        doneS = true;
        complete();
    });

    createFamilies(defaultObjects.kingFamilies, settings.family, function () {
        createFamilies(defaultObjects.peerFamilies, settings.family, function () {
            createFamilies(defaultObjects.lordFamilies, settings.family, function () {
                createFamilies(defaultObjects.nonPlayerSirFamilies, settings.family, function () {
                    createFamilies(defaultObjects.sirFamilies, settings.family, function () {
                        createFamilies(defaultObjects.bachelorKnights, settings.family, function () {
                            doneFamilies = true;
                            complete();
                        });
                    });
                });
            });
        });
    });

    return result;
};

GameSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

GameSchema.methods.clearEvents = function () {
    "use strict";
    var index;
    
    for (index = 0; index < this.queuedEvents.length; index += 1) {
        // do not filter by satisfies for removing events
        if (this.queuedEvents[index].filterByTurn(this.turn)) {
            this.queuedEvents.splice(index, 1);
            index -= 1;
        }
    }

    return this;
};

GameSchema.methods.getEvents = function (cb) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this,
        result = [],
        doneF = false,
        doneC = false,
        complete = function () {
            if (doneF && doneC) {
                doneF.game = that;  // doneF contains data object with results array embedded within it
                doneF.court = doneC instanceof Court ? doneC : null;

                if (cb) {cb(doneF); }
            }
        };
    
    console.log("%s %s", that.turn.year, that.turn.quarter);
    console.log("Game events");

    // TODO: order of events is:
    //    game events (year or season events for the whole of the game)
    //    family events
    //    patriarch events
    //    holding events
    //    lesser knight events
    //    ladies events
    //    squire events
    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(that.turn, that.satisfies)) {
            console.log('Event: %s', e.name);
            result.push(e);
        }
    });

    // only get events for the player's family
    Family.findById(this.playerFamily, function (err, doc) {
        if (err) {return err; }
        doc.getEvents(that, result, function (data) {
            doneF = data;
            complete();
        });
    });
    
    if (that.court) {
        Court.findById(that.court, function (err, court) {
            if (err) {return err; }
        
            if (court) {
                court.getEvents(that, result, function (data) {
                    doneC = data;
                    complete();
                });
            } else {
                that.court = null;
                doneC = true;
                complete();
            }
        });
    } else {
        doneC = true;
        complete();
    }
    
    return this;
};

GameSchema.methods.nextTurn = function (options, cb) {
    "use strict";
    // Every Year
    // TODO map
    
    var that = this,
        nextSeason,
        nextYear = this.turn.year,
        doneF = false,
        doneC = !that.court,
        doneNextC = false,
        complete = function () {
            if (doneNextC && doneF && doneC) {
                that.turn.quarter = nextSeason;
                that.turn.year = nextYear;

                Storyline.find({year: that.turn.year,
                                quarter: that.turn.quarter,
                                isTemplate: true
                    }, function (err, evs) {
                    if (err) {return err; }
                       
                    evs.forEach(function (e) {
                        e.isTemplate = false;
                        that.queuedEvents.push(e);
                    });

                    that.save(function (err, g) {
                        g.getEvents(cb);
                    });
                });
            }
        };

    console.log('Next turn for game %s', that.id);
    
    this.clearEvents();

    if (that.court && options) {
        Court.findById(that.court, function (err, court) {
            if (err) {return err; }
        
            if (court) {
                options.changes.court.attendance = options.changes.attendance;
                court.nextTurn(options.changes.court, that, function () {
                    doneC = true;
                    complete();
                });
            } else {
                doneC = true;
                complete();
            }
        });
    }

    Family.find({game: that.id}, function (err, families) {
        var counter = 0,
            l = families.length;

        families.forEach(function (f) {
            f.nextTurn(f.id === String(that.playerFamily) ? options : null, that, function () {
                counter += 1;

                if (counter === l) {
                    doneF = true;
                    complete();
                }
            });
        });
    });
    
    switch (this.turn.quarter) {
    case 'Winter':
        // determine holding events
        // TODO determine family births
        // TODO steward advice
        nextSeason = 'Spring';
        break;
    case 'Spring':
        // determine pentacost court plans
            //
            // Court is held every Pentacost and Christmas with a few
            // exceptions. Whenever there is a king, the king holds court for
            // both; though the location of the court varies by year. Whether
            // or not there is a king, Earls often hold their own court for
            // either Pentacost or Christmas or both.
            //
            // TODO: Currently there is no choice for the character to not attend
            // court or to attend the court of their choice.
            //
            // To hold a court, determine which lords (if any) invites the
            // player to their court for Pentacost. Then determine who else
            // is invited. The player is to get an invite as an event in Winter
            // if there is a following Pentacost court. It is possible that
            // the player is not invited to any court for a given year, for
            // example if there is no liege for the player or if the player's
            // liege is at the King's court but the player was not invited.
            //
            // Court will last 2-3 days. At court, events (such as hunting, horse
            // racing, etc) will be organized for mornings or afternoons.
            // Characters wishing to organize events can attempt to do for any
            // open time slots in the court's calendar. Characters participating
            // in an event can perform an opposed check for special results.
            //
            // At court, each unmarried character has a slim change of being
            // tempted into a dalliance.
            //
        nextSeason = 'Summer';
        break;
    case 'Summer':
        // TODO determine campaign season
        // determine training results
        // determine pregnancies
        nextSeason = 'Fall';
        break;
    case 'Fall':
        // age each character a year
        // determine harvest results
        // peasant population growth
        // determine hatred fallout
        // determine next year's projected income
        // determine investment completions
        // experience checks for all family members
        // determine Christmas court
        // TODO determine generosity results
        nextSeason = 'Winter';
        nextYear += 1;
        break;
    default:
        throw {
            name: 'Invalid quarter',
            message: 'GameSchema.methods.nextTurn'
        };
    }

    Court.findOne({year: nextYear, season: nextSeason})
        .where('presidingObj').exists() // build from template court
        .exec(function (err, court) {
            if (err) {return err; }
            
            if (court) {
                Court.factory(court, that, function (err, c) {
                    that.court = c.id;

                    doneNextC = true;
                    complete();
                });
            } else {
                that.court = null;

                doneNextC = true;
                complete();
            }
        });
    
    return this;
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
