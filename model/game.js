
/*
 * Game model
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    defaultObjects = require('./../model/defaultObjects'),
    Family = require('./family'),
    TimelineEvent = require('./timelineevent');

var GameSchema = new Schema( {
    owner:      { type:ObjectId, required:true },
    settings:   Object,
    state:      String,
    families:   [Family.schema],
    turn:       { year:Number, quarter:String }
});


GameSchema.statics.factory = function( settings, ownerId, cb) {
    var result = new Game({owner:ownerId,
                           settings:settings,
                           state:'initial',
                           turn:{year:490,quarter:"Winter"}
                          });

    defaultObjects.families.forEach( function(memeTemplate) {
        var f = Family.factory(memeTemplate, settings);
        if(settings.family == f.name)
            result.families.unshift(f);      // player is always the zeroeth element
        else
            result.families.push(f);
    });

    result.update(cb);
};

GameSchema.methods.update = function(cb) {
    this.save( function(err,game) {
        if(cb) cb(err,game);
    });
};

GameSchema.methods.satisfies = function( requirements) {
    return true;    // TODO
};

GameSchema.methods.getEvents = function(result) {
    if( !result)
        result = new Array();
    
    // add timeline events
    var game = this;
    defaultObjects.timelineEvents.forEach( function(e) {
        if( e.year == game.turn.year && e.quarter == game.turn.quarter
           && game.satisfies(e.requirements)) {
            result.push( TimelineEvent.factory(e));
        }
    });
    
    // add family events
    this.families[0].getEvents( game.turn, result);
    
    return result;
};

GameSchema.methods.mergeOptions = function( options) {
    this.families[0].mergeOptions(options);
};

GameSchema.methods.nextTurn = function(cb) {
    var err = null;

    // end quarter
    this.families.forEach( function(f) {f.endQuarter();});
    switch( this.turn.quarter) {
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
            this.turn.year++;
            break;
        default:
            throw 'Invalid quarter';
    }

    this.update(cb);
};


var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
