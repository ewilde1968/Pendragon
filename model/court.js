/*
 * Court model
*/
/*global export, require, module */

var Court; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Family = require('./family'),
    Locale = require('./locale'),
    Knight = require('./knight'),
    Storyline = require('./storyline');

var CourtSchema = new Schema({
    year:           Number,
    season:         String,
    name:           String,
    presiding:      String,
    locale:         String,
    guests:         Object,
    news:           Object,
    gossip:         String,
    intrigue:       {Fumble: String, Success: String, 'Critical Success': String},
    maidens:        Object,
    friday:         {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    saturday:       {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    sunday:         {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    opportunities:  Object,
    activities:     Object
});


CourtSchema.statics.factory = function (template, cb) {
    "use strict";
    var result = new Court(template);
    
    result.save(function (err) {
        if (err) {return err; }
        if (cb) {return cb(); }
    });
                
    return result;
};

CourtSchema.methods.location = function (game, cb) {
    "use strict";
    var presiding,
        locale,
        complete = function () {
            if (presiding && locale && cb) {
                cb(presiding, locale);
            }
        },
        findLocale = function (id) {
            Locale.findOne({landlord: id}, 'name', function (err, l) {
                if (err) {return err; }
                if (l) {
                    locale = l.name;
                    complete();
                } else {
                    throw {
                        name: 'invalid court object',
                        message: 'locale not properly set'
                    };
                }
            });
        },
        findPresiding = function (id) {
            Family.findById(id, 'rank patriarch', function (err, family) {
                if (err) {return err; }

                if (family) {
                    Knight.findById(family.patriarch, 'name', function (err, patriarch) {
                        if (err) {return err; }
                        
                        if (patriarch) {
                            presiding = family.rank + ' ' + patriarch.name;
                            complete();
                        } else {
                            throw {
                                name: 'invalid court object',
                                message: 'cannot find presiding patriarch'
                            };
                        }
                    });
                } else {
                    throw {
                        name: 'invalid court object',
                        message: 'cannot find presiding family'
                    };
                }
            });
        };
    
    switch (this.locale) {
    case 'liege':
        Family.findById(game.playerFamily, 'liege patriarch', function (err, f) {
            if (err) {return err; }
            

            if (f) {
                findLocale(f.liege);
                findPresiding(f.liege);
            } else {
                throw {
                    name: 'invalid court object',
                    message: 'cannot find player family'
                };
            }
        });
        break;
    case 'player':
        findLocale(game.playerFamily);
        findPresiding(game.playerFamily);
        break;
    case 'king':
        Family.findById(game.playerFamily, function (err, family) {
            if (err) {return err; }

            if (family) {
                family.findKing(function (king) {
                    if (king) {
                        findLocale(king);
                        findPresiding(king);
                    } else {
                        throw {
                            name: 'invalid court object',
                            message: 'unable to find king of player family'
                        };
                    }
                });
            } else {
                throw {
                    name: 'invalid court object',
                    message: 'unable to find player family for king'
                };
            }
        });
        break;
    default:
    }
};

CourtSchema.methods.getEvents = function (game, result, cb) {
    "use strict";
    // events announcing a court that is yet to be held
    var that = this,
        ev = {
            title: that.name,
            message: 'To be held at ',
            actions: {log: true},
            choices: [
                {label: 'Go with entourage'},
                {label: 'Go with only squire'},
                {label: 'Refuse to attend'}
            ]
        };
    
    that.location(game, function (presiding, locale) {
        ev.message += locale + ', ' + presiding + ' presiding.';
        result.push(Storyline.factory(ev));
        
        if (cb) {cb(); }
    });
};

CourtSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    // add any results to game event queue since the court event queue is to set up a coming court
};


var Court = mongoose.model('Court', CourtSchema);
module.exports = Court;
