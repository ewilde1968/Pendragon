/*
 * Character model
*/
/*global export, require, module */

var Character; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Statistic = require('./statistic'),
    Storyline = require('./storyline');


var decreptitudeYear = [];
decreptitudeYear[21] = +1;
decreptitudeYear[40] = -1;
decreptitudeYear[70] = -1;
decreptitudeYear[90] = -1;

// Character stats and skills are all 0-10
// A character stat is treated exactly as a skill for tests

var CharacterSchema = new Schema({
    name:           { type: String, required: true, index: true },
    profession:     { type: String, required: true },
    age:            Number,
    bodyType:       String,
    health:         Number,
    body:           Number,
    mind:           Number,
    soul:           Number,
    honor:          Number,
    fertility:      Boolean,
    statistics:     [Statistic.schema],
    armor:          String,
    shield:         Boolean,
    horses:         [{name: String, breed: String, barding: String, health: Number}],
    parents:        [{type: ObjectId, ref: 'Character'}],
    spouse:         {type: ObjectId, ref: 'Character'},
    game:           ObjectId,
    queuedEvents:   [Storyline.schema]
}, {collection: 'characters', discriminatorKey: '_type' });


CharacterSchema.statics.factory = function (template, game) {
    "use strict";
    var result = new Character(template);
    this.initialize(template, game);
    
    return result;
};

CharacterSchema.methods.initialize = function (template, game) {
    "use strict";
    if (!template.mind || !template.body || !template.soul) {
        this.generateStats();   // TODO find inheretance pattern
    }
    
    if (template.age >= 14) {this.fertility = true; }
    
    if (game) {this.game = game; }
    
    return this;
};

CharacterSchema.methods.generateStats = function () {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0:
        this.bodyType = 'ectomorph';
        this.statistics.push(Statistic.factory({name: 'Body', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Learning', level: 3}));
        break;
    case 1:
        this.bodyType = 'mesomorph';
        this.statistics.push(Statistic.factory({name: 'Body', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Brawling', level: 3}));
        break;
    case 2:
        this.bodyType = 'leader';
        this.statistics.push(Statistic.factory({name: 'Body', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Leadership', level: 3}));
        break;
    case 3:
        this.bodyType = 'spiritual dunce';
        this.statistics.push(Statistic.factory({name: 'Body', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 4}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 7}));
        this.statistics.push(Statistic.factory({name: 'Religion', level: 3}));
        break;
    case 4: // balance
        this.bodyType = 'cygnus';
        this.statistics.push(Statistic.factory({name: 'Body', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Health', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Mind', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Soul', level: 5}));
        this.statistics.push(Statistic.factory({name: 'Religion', level: 3}));
        break;
    }
    
    return this;
};

CharacterSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

CharacterSchema.methods.clearEvents = function (turn) {
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

CharacterSchema.methods.getEvents = function (turn, result) {
    "use strict";
    // see which events match the current turn and return
    // an array of all such Storyline objects
    var that = this;
    
    if (!result) {
        result = [];
    }
    
    this.queuedEvents.forEach(function (e) {
        var actions;
        
        if (e.filterByTurn(turn, that.satisfies)) {
            if (e.actions) {
                actions = JSON.parse(e.actions);
                if ('Locale' === actions.target) {
                    actions.target = that.id;
                }
                e.actions = JSON.stringify(actions);
            }

            result.push(e);
        }
    });
    
    return result;
};

CharacterSchema.methods.mergeOptions = function (options) {
    "use strict";
    var prop,
        setExperience = function (s) {
            if (options.experience.indexOf(s.name) !== -1) {s.experience = true; }
        };
    for (prop in options) {
        if (options.hasOwnProperty(prop)) {
            switch (prop) {
            case 'experience':
                this.statistics.forEach(setExperience);
                break;
            case 'name':
            case 'age':
            case 'profession':
            case 'health':
            case 'body':
            case 'mind':
            case 'spirit':
            case 'honor':
                this[prop] = options[prop];
                break;
            default:
                break;
            }
        }
    }
    
    return this;
};

CharacterSchema.methods.increaseAge = function (years) {
    "use strict";
    this.age += years || 1;

    // check to see if the body and health values change this year
    if (decreptitudeYear[this.age]) {
        this.body += decreptitudeYear[this.age];
        this.health += decreptitudeYear[this.age];  // TODO check for death as this.health setter
    }

    if (this.age >= 14) {this.fertility = true; }

    return this;
};

CharacterSchema.methods.increaseStat = function (name, value) {
    "use strict";
    var stat;
    
    this.statistics.forEach(function (s) {
        if (s.name === name) {
            stat = s;
        }
    });
    
    if (!stat) {
        stat = Statistic.factory({name: name, level: 0});
        this.statistics.push(stat);
    }
    
    stat.increase(value);
    
    return this;
};

CharacterSchema.methods.getStat = function (name) {
    "use strict";
    var result = null;
    this.statistics.forEach(function (s) {if (name === s.name) {result = s; } });
    
    return result;
};

CharacterSchema.methods.marriagable = function () {
    "use strict";
    return !this.spouse;
};

CharacterSchema.methods.dalliance = function (family, game, partnerId, cb) {
    "use strict";
    // no-op for most people
    if (cb) {cb(); }
};

CharacterSchema.methods.temptation = function (sin, family, game, data, cb) {
    "use strict";
    // data is different per sin
    var check = this.getStat('Soul').difficultyCheck(5),
        doCB = true;

    switch (sin) {
    case 'Lust':
        if (this.fertility && (check === 'Failure' || check === 'Fumble')) {
            doCB = false;
            this.dalliance(family, game, data, cb);
        }
        break;
    case 'Gluttony':
        break;
    case 'Greed':
        break;
    case 'Sloth':
        break;
    case 'Wrath':
        break;
    case 'Envy':
        break;
    case 'Pride':
        break;
    default:
        throw {
            name: 'Invalid Temptation',
            message: sin + ' temptation for ' + this.name
        };
    }
    
    if (doCB && cb) {cb(); }
};

CharacterSchema.methods.cost = function (livingStandard) {
    "use strict";
    // ladies and squires are free
    // stewards count against their holding's costs
    
    // TODO not calling Knight's cost function?
    // See https://github.com/briankircho/mongoose-schema-extend/issues/11
    if (this.profession === 'Knight') {
        switch (livingStandard) {
        case 'Poor':
            return 1;
        case 'Normal':
            return 4;
        case 'Rich':
            return 8;
        case 'Opulent':
            return 12;
        default:
            throw {
                name: 'Invalid living standard',
                message: 'CharacterSchema.methods.cost for ' + this.name
            };
        }
    }

    return 0;
};

CharacterSchema.methods.nextTurn = function (options, game, cb) {
    "use strict";
    var that = this,
        cost = 0;
    
    that.mergeOptions(options);
    that.clearEvents(game.turn);
    
    switch (game.turn.quarter) {
    case "Winter":
        break;
    case "Spring":
        break;
    case "Summer":
        break;
    case "Fall":
        // age each character a year
        that.increaseAge();

        // experience checks for all family members
        that.statistics.forEach(function (s) {s.experienceCheck(); });
        
        cost = that.cost();
        break;
    default:
        break;
    }
    
    that.save(function (err) {
        if (err) {return err; }
        cb(cost);
    });
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
