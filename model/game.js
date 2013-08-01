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
    state:          String,
    families:       [Family.schema],
    turn:           { year: Number, quarter: String },
    queuedEvents:   [TimelineEvent.schema]
});


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var result = new Game({owner: ownerId,
                           settings: settings,
                           state: 'initial',
                           turn: {year: 485, quarter: "Winter"}
                          });

    defaultObjects.families.forEach(function (memeTemplate) {
        var f = Family.factory(memeTemplate, settings);
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
        game = this,
        qe = this.queuedEvents,
        index,
        e;

    // add family events first
    if (!removeOld) {
        this.families[0].getEvents(this.turn, result);  // only add events for the player's family
    } else {
        this.families.forEach(function (f) {f.getEvents(game.turn, result); });
    }

    // add timeline events
    if (qe && qe.length > 0) {
        for (index = 0; index < qe.length; index += 1) {
            e = qe[index];
            if ((!e.year || e.year === game.turn.year)
                    && (!e.quarter || e.quarter === game.turn.quarter)
                    && game.satisfies(e.requirements)) {
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

GameSchema.methods.nextTurn = function (cb) {
    "use strict";
    var err = null;

    switch (this.turn.quarter) {
    case 'Winter':
        this.turn.quarter = 'Spring';
        break;
    case 'Spring':
        this.turn.quarter = 'Summer';
        break;
    case 'Summer':
        this.turn.quarter = 'Fall';
        break;
    case 'Fall':
        this.turn.quarter = 'Winter';
        this.turn.year += 1;
        break;
    default:
        throw 'Invalid quarter';
    }

    this.update(cb);
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
