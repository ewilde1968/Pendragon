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
    owner:      { type: ObjectId, required: true },
    settings:   Object,
    state:      String,
    families:   [Family.schema],
    turn:       { year: Number, quarter: String }
});


GameSchema.statics.factory = function (settings, ownerId, cb) {
    "use strict";
    var result = new Game({owner: ownerId,
                           settings: settings,
                           state: 'initial',
                           turn: {year: 490, quarter: "Winter"}
                          });

    defaultObjects.families.forEach(function (memeTemplate) {
        var f = Family.factory(memeTemplate, settings);
        if (settings.family === f.name) {
            result.families.unshift(f);      // player is always the zeroeth element
        } else {
            result.families.push(f);
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

GameSchema.methods.getEvents = function () {
    "use strict";
    var result = {shown: [], subEvents: []},
        game = this;

    // add family events first
    this.families[0].getEvents(this.turn, result.shown);

    // add timeline events
    defaultObjects.timelineEvents.forEach(function (e) {
        if (e.year === game.turn.year && e.quarter === game.turn.quarter
                && game.satisfies(e.requirements)) {
            result.shown.push(TimelineEvent.factory(e, result.subEvents));
        }
    });

    return result;
};

GameSchema.methods.mergeOptions = function (options) {
    "use strict";
    this.families[0].mergeOptions(options);
};

GameSchema.methods.nextTurn = function (cb) {
    "use strict";
    var err = null;

    // end quarter
    this.families.forEach(function (f) {f.endQuarter(); });
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
