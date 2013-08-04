/*
 * Game model
*/
var Game, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Family = require('./family'),
    TimelineEvent = require('./timelineevent');

var GameSchema = new Schema({
    owner:          { type: ObjectId, required: true },
    settings:       Object,
    families:       [Family.schema],
    turn:           { year: Number, quarter: String },
    queuedEvents:   [TimelineEvent.schema]
});


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var result = new Game({owner: ownerId,
                           settings: settings,
                           turn: {year: 485, quarter: "Winter"}
                          });

    defaultObjects.families.forEach(function (template) {
        var f = Family.factory(template, settings);
        if (settings.family === f.name) {
            result.families.unshift(f);      // player is always the zeroeth element
        } else {
            result.families.push(f);
        }
    });

    defaultObjects.timelineEvents.forEach(function (e) {
        if (e.year === result.turn.year && e.quarter === result.turn.quarter
                && result.satisfies(e.requirements)) {
            result.queuedEvents.push(TimelineEvent.factory(e, result.queuedEvents));
        }
    });

    result.update(cb);
};

GameSchema.methods.update = function (cb) {
    "use strict";
    this.save(cb);
};

GameSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

GameSchema.methods.getEvents = function (removeOld) {
    "use strict";
    var result = removeOld ? null : [],
        that = this,
        qe = this.queuedEvents,
        index,
        e;

    // add family events first
    if (!removeOld) {
        this.families[0].getEvents(this.turn, result);  // only add events for the player's family
    } else {
        this.families.forEach(function (f) {f.getEvents(that.turn, result); });
    }

    // add timeline events
    if (qe && qe.length > 0) {
        for (index = 0; index < qe.length; index += 1) {
            e = qe[index];
            if ((!e.year || e.year === this.turn.year)
                    && (!e.quarter || e.quarter === this.turn.quarter)
                    && this.satisfies(e.requirements)) {
                if (!result) {
                    qe.splice(index, 1);
                    index -= 1;
                } else {
                    result.push(e);
                }
            }
        }
    }

    return result;
};

GameSchema.methods.mergeOptions = function (options) {
    "use strict";
    this.families[0].mergeOptions(options);
};

GameSchema.methods.endQuarter = function () {
    "use strict";
    this.getEvents(true);   // throw out the old events

    this.families.forEach(function (f) {f.endQuarter(); });
};

GameSchema.methods.winter = function () {
    "use strict";
    // Activities that occur in Winter:
    //      age each character a year
        // TODO determine peasant population growth
        // TODO determine hatred fallout
        // TODO determine holding events
        // TODO determine pentacost court plans
    var that = this;
    this.families.forEach(function (f) {
        f.winter(that);
    });
};

GameSchema.methods.spring = function () {
    "use strict";
    // Activities that occur in Spring:
        // TODO determine pentacost court results
        // TODO determine any marriages or daliances
        // TODO determine campaign season plans
        // TODO determine campaign season quests
    var that = this;
    this.families.forEach(function (f) {
        f.spring(that);
    });
};

GameSchema.methods.summer = function () {
    "use strict";
    // Activities that occur in Summer:
        // TODO determine campaign season results
        // TODO determine quest results
        // TODO determine pregnancies
        // TODO determine Christmas court plans
    var that = this;
    this.families.forEach(function (f) {
        f.summer(that);
    });
};

GameSchema.methods.fall = function () {
    "use strict";
    // Activities that occur in Fall:
        // TODO determine harvest results
        // TODO determine investment completions
        // TODO determine training results
    // experience checks for all family members
        // TODO determine generosity results
        // TODO determine Christmas court results
        // TODO determine any marriages or daliances
    var that = this;
    this.families.forEach(function (f) {
        f.fall(that);
    });
};

GameSchema.methods.nextTurn = function (cb) {
    "use strict";
    var err = null;

    switch (this.turn.quarter) {
    case 'Winter':
        this.winter();
        this.turn.quarter = 'Spring';
        break;
    case 'Spring':
        this.spring();
        this.turn.quarter = 'Summer';
        break;
    case 'Summer':
        this.summer();
        this.turn.quarter = 'Fall';
        break;
    case 'Fall':
        this.fall();
        this.turn.quarter = 'Winter';
        this.turn.year += 1;
        break;
    default:
        throw {
            name: 'Invalid quarter',
            message: 'GameSchema.methods.nextTurn'
        };
    }

    this.update(cb);
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
