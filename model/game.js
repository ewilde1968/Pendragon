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
    settings:       Object,
    families:       [Family.schema],
    turn:           { year: Number, quarter: String },
    queuedEvents:   [Storyline.schema]
});


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var counter = 0,
        result = new Game({owner: ownerId,
                           settings: settings,
                           turn: {year: 485, quarter: "Winter"}
                          });

    Storyline.find({year: result.turn.year,
                    quarter: result.turn.quarter
                   }, function (err, evs) {
        if (err) {return err; }
                       
        evs.forEach(function (e) {
            result.queuedEvents.push(e);
        });

        defaultObjects.families.forEach(function (template) {
            Family.factory(template, settings, function (err, f) {
                if (err) {return err; }

                if (settings.family === f.name) {
                    result.families.unshift(f);      // player is always the zeroeth element
                } else {
                    result.families.push(f);
                }
                
                counter += 1;
                if (counter >= defaultObjects.families.length) {
                    // done creating game object
                    result.update(cb);
                }
            });
        });
    });

    return result;
};

GameSchema.methods.update = function (cb) {
    "use strict";
    this.save(cb);
    
    return this;
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

    // only get events for the player's family
    this.families[0].getEvents(that.turn, result);
    
    this.queuedEvents.forEach(function (e) {
        if (e.filterByTurn(that.turn, that.satisfies)) {
            result.push(e);
        }
    });
    
    if (cb) {cb(result); }
    
    return this;
};

GameSchema.methods.mergeOptions = function (options, cb) {
    "use strict";
    this.families[0].mergeOptions(options, cb); // callback called through families

    return this;
};

GameSchema.methods.endQuarter = function () {
    "use strict";
    var that = this;
    
    this.clearEvents();
    this.families.forEach(function (f) {f.endQuarter(that.turn); });
    
    return this;
};

GameSchema.methods.winter = function (cb) {
    "use strict";
    // Activities that occur in Winter:
    //      age each character a year
        // TODO determine peasant population growth
        // TODO determine hatred fallout
    //      determine holding events
        // TODO determine pentacost court plans
    var that = this,
        counter = 0,
        l = this.families.length;
    
    this.families.forEach(function (f) {
        f.winter(that, function () {
            counter += 1;
            if (cb && counter === l) {cb(); }
        });
    });
    
    return this;
};

GameSchema.methods.spring = function (cb) {
    "use strict";
    // Activities that occur in Spring:
        // TODO determine pentacost court results
        // TODO determine any marriages or daliances
        // TODO determine campaign season plans
        // TODO determine campaign season quests
    var that = this,
        counter = 0,
        l = this.families.length;
    
    this.families.forEach(function (f) {
        f.spring(that, function () {
            counter += 1;
            if (cb && counter === l) {cb(); }
        });
    });
    
    return this;
};

GameSchema.methods.summer = function (cb) {
    "use strict";
    // Activities that occur in Summer:
        // TODO determine campaign season results
        // TODO determine quest results
        // TODO determine pregnancies
        // TODO determine Christmas court plans
    var that = this,
        counter = 0,
        l = this.families.length;
    
    this.families.forEach(function (f) {
        f.summer(that, function () {
            counter += 1;
            if (cb && counter === l) {cb(); }
        });
    });
    
    return this;
};

GameSchema.methods.fall = function (cb) {
    "use strict";
    // Activities that occur in Fall:
        // TODO determine harvest results
        // TODO determine investment completions
        // TODO determine training results
    // experience checks for all family members
        // TODO determine generosity results
        // TODO determine Christmas court results
        // TODO determine any marriages or daliances
    var that = this,
        counter = 0,
        l = this.families.length;
    
    this.families.forEach(function (f) {
        f.fall(that, function () {
            counter += 1;
            if (cb && counter === l) {cb(); }
        });
    });
    
    return this;
};

GameSchema.methods.nextTurn = function (cb) {
    "use strict";
    var that = this,
        nextSeason,
        nextYear = this.turn.year,
        f = function () {
            that.turn.quarter = nextSeason;
            that.turn.year = nextYear;
            that.update(cb);
        };

    switch (this.turn.quarter) {
    case 'Winter':
        nextSeason = 'Spring';
        this.winter(f);
        break;
    case 'Spring':
        nextSeason = 'Summer';
        this.spring(f);
        break;
    case 'Summer':
        nextSeason = 'Fall';
        this.summer(f);
        break;
    case 'Fall':
        nextSeason = 'Winter';
        nextYear += 1;
        this.fall(f);
        break;
    default:
        throw {
            name: 'Invalid quarter',
            message: 'GameSchema.methods.nextTurn'
        };
    }
    
    return this;
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
