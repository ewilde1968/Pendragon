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
    Character = require('./character'),
    Knight = require('./knight'),
    Storyline = require('./storyline');

var CourtSchema = new Schema({
    year:           Number,
    season:         String,
    name:           String,
    invitation:     String,
    presiding:      [{type: ObjectId, ref: 'Character'}],
    presidingObj:   Object,
    locale:         [{type: ObjectId, ref: 'Locale'}],
    localeObj:      Object,
    guests:         [{type: ObjectId, ref: 'Character'}],
    guestsObj:      Object,
    news:           Object,
    gossip:         String,
    intrigue:       {Fumble: String, Success: String, 'Critical Success': String},
    friday:         {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    saturday:       {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    sunday:         {morning: {activity: String, opportunities: [Object]},
                     evening: {activity: String, opportunities: [Object]}},
    opportunities:  Object,
    activities:     Object
});


CourtSchema.statics.factory = function (template, game, cb) {
    "use strict";
    var result = new Court({
            year: template.year,
            season: template.season,
            name: template.name,
            gossip: template.gossip,
            intrigue: template.intrigue,
            localeObj: template.locale,
            guestsObj: template.guests,
            presidingObj: template.presiding
        }),
        doneNews = true,                // TODO
        doneOpp = true,                 // TODO
        doneAct = true,                 // TODO
        complete = function () {
            if (doneAct && doneOpp && doneNews) {
                result.save(function (err) {
                    if (err) {return err; }
                    if (cb) {cb(); }
                });
            }
        };
    
    complete();
    
    return result;
};

CourtSchema.methods.addGuestList = function (game, cb) {
    "use strict";
    var that = this,
        presiding,
        locale = !that.locale,
        pf = game.playerFamily,
        guestLimit = 0,
        vassals = !that.guestsObj || !that.guestsObj.vassals,
        prop,
        complete = function () {
            if (0 === guestLimit && presiding && vassals && locale && cb) {
                that.invitation = 'To be held at ' + locale + ', ' + presiding + ' presiding.';
                that.save(cb);
            }
        },
        findLocale = function (id) {
            Locale.findOne({landlord: id}, 'name', function (err, l) {
                if (err) {return err; }
                if (l) {
                    that.locale = l;
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
                    if (!vassals) {
                        Family.find({liege: family.id}, function (err, docs) {
                            if (err) {return err; }
                            
                            docs.forEach(function (doc) {
                                if (false === that.guestsObj[doc.name] && that.guests.indexOf(doc) !== -1) {
                                    // pull explicitly not appearing vassals
                                    that.guests.pull(doc);
                                } else if (doc.id !== pf && doc.patriarch) {
                                    // skip player family as player will make attendance decision
                                    that.guests.addToSet(doc.patriarch);
                                }
                            });

                            vassals = true;
                            complete();
                        });
                    }
                    
                    Knight.findById(family.patriarch, 'name', function (err, patriarch) {
                        if (err) {return err; }
                        
                        if (patriarch) {
                            that.presiding = patriarch;
                            that.guests.unshift(patriarch);
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
        },
        findGuest = function (name) {
            Character.findOne({game: game.id, name: name}, function (err, doc) {
                if (err) {return err; }

                if (doc) {
                    if (that.guestsObj[name]) {
                        that.guests.addToSet(doc);
                    } else if (that.guests.indexOf(doc) !== -1) {
                        that.guests.pull(doc);
                    }
                }   // skip the unfound characters
                
                guestLimit -= 1;
                complete();
            });
        };
    
    switch (that.localeObj) {
    case 'liege':
        Family.findById(pf, 'liege patriarch', function (err, f) {
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
        findLocale(pf);
        findPresiding(pf);
        break;
    case 'king':
        Family.findById(pf, function (err, family) {
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
  
    if (that.guestsObj) {
        for (prop in that.guestsObj) {
            if (that.guestsObj.hasOwnProperty(prop)) {
                guestLimit += 1;
            
                switch (prop) {
                case 'vassals':
                    guestLimit -= 1;  // handled above
                    break;
                default:
                    findGuest(prop);
                    break;
                }
            }
        }
    }
};

CourtSchema.methods.getEvents = function (game, result, cb) {
    "use strict";
    // events announcing a court that is yet to be held
    var that = this,
        storyline,
        ev = {
            title: that.name,
            message: that.invitation,
            actions: {log: true},
            choices: [
                {label: 'Go with entourage'},
                {label: 'Go with only squire'},
                {label: 'Refuse to attend'}
            ]
        },
        complete = function () {
            if (storyline) {
                result.push(storyline);
                
                that.populate({path: 'guests', model: 'Character'}, function (err, doc) {
                    if (cb) {cb(doc); }
                });
            }
        };
    
    if (that.guests.length === 0) {
        that.addGuestList(game, function () {
            ev.message = that.invitation;
            storyline = Storyline.factory(ev);
            complete();
        });
    } else {
        storyline = Storyline.factory(ev);
        complete();
    }
};

CourtSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    // add any results to game event queue since the court event queue is to set up a coming court
};


var Court = mongoose.model('Court', CourtSchema);
module.exports = Court;
