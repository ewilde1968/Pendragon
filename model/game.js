/*
 * Game model
*/
/*global export, require, module */

var Game; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Family = require('./family'),
    Storyline = require('./storyline');

var GameSchema = new Schema({
    owner:          { type: ObjectId, required: true },
    playerFamily:   ObjectId,
    settings:       Object,
    turn:           { year: Number, quarter: String },
    queuedEvents:   [Storyline.schema]
});

// in order to avoid 1:many querries
//      Families of game are queried via game of the family


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var that = this,
        counterNPF = 0,
        limitNPF = defaultObjects.nonPlayerFamilies.length,
        doneNPF = limitNPF === 0,
        counterPF = 0,
        limitPF = defaultObjects.families.length,
        donePF = limitPF === 0,
        result = new Game({owner: ownerId,
                           settings: settings,
                           turn: {year: 485, quarter: "Winter"}
                          }),
        complete = function () {
            if (doneNPF && donePF) {
                result.save(cb);
            }
        };

    Storyline.find({year: result.turn.year,
                    quarter: result.turn.quarter
                   }, function (err, evs) {
        if (err) {return err; }
                       
        evs.forEach(function (e) {
            e.parent = that.id;
            result.queuedEvents.push(e);
        });

        defaultObjects.nonPlayerFamilies.forEach(function (template) {
            template.game = result.id;

            Family.factory(template, settings, function (f) {
                counterNPF += 1;
                if (counterNPF >= limitNPF) {
                    doneNPF = true;
                    complete();
                }
            });
        });

        defaultObjects.families.forEach(function (template) {
            template.game = result.id;

            Family.factory(template, settings, function (f) {
                if (settings.family === f.name) {
                    result.playerFamily = f.id;
                }
                
                counterPF += 1;
                if (counterPF >= limitPF) {
                    donePF = true;
                    complete();
                }
            });
        });
    });

    complete();

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
        result = [];

    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(that.turn, that.satisfies)) {
            result.push(e);
        }
    });

    // only get events for the player's family
    Family.findById(this.playerFamily, function (err, doc) {
        if (err) {return err; }
        doc.getEvents(that, result, function (data) {
            data.game = that;
            if (cb) {cb(data); }
        });
    });
    
    return this;
};

GameSchema.methods.nextTurn = function (options, cb) {
    "use strict";
    var that = this,
        nextSeason,
        nextYear = this.turn.year;

    this.clearEvents();

    switch (this.turn.quarter) {
    case 'Winter':
        // determine hatred fallout
        // determine holding events
        // TODO steward advice
        // TODO determine pentacost court plans - Up Next!
            // TODO who is in attendance
            // TODO events
            // TODO political opportunities
            // TODO romance opportunities
        // TODO determine family births
        nextSeason = 'Spring';
        break;
    case 'Spring':
        // TODO determine pentacost court results
        // TODO determine any marriages or daliances
        // TODO determine campaign season
        // TODO determine quests
        nextSeason = 'Summer';
        break;
    case 'Summer':
        // determine training results
        // TODO determine pregnancies
        // TODO campaign season results
        // TODO determine Christmas court plans
        nextSeason = 'Fall';
        break;
    case 'Fall':
        // age each character a year
        // determine harvest results
        // peasant population growth
        // determine next year's projected income
        // determine investment completions
        // experience checks for all family members
        // TODO determine generosity results
        // TODO determine Christmas court results
        // TODO determine any marriages or daliances
        nextSeason = 'Winter';
        nextYear += 1;
        break;
    default:
        throw {
            name: 'Invalid quarter',
            message: 'GameSchema.methods.nextTurn'
        };
    }
    
    Family.find({game: that.id}, function (err, families) {
        var counter = 0,
            l = families.length;

        families.forEach(function (f) {
            f.nextTurn(f.id === String(that.playerFamily) ? options : null, that, function () {
                counter += 1;

                if (counter === l) {
                    that.turn.quarter = nextSeason;
                    that.turn.year = nextYear;
                        
                    that.save(function (err, g) {
                        g.getEvents(cb);
                    });
                }
            });
        });
    });

    return this;
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
