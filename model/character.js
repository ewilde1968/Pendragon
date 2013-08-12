/*
 * Character model
*/
/*global export, require, module */

var Character; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Storyline = require('./storyline');


var decreptitudeYear = [];
decreptitudeYear[21] = +1;
decreptitudeYear[40] = -1;
decreptitudeYear[70] = -1;
decreptitudeYear[90] = -1;


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
    skills:         [Skill.schema],
    armor:          String,
    shield:         Boolean,
    horses:         [{name: String, breed: String, barding: String, health: Number}],
    parents:        [ObjectId],
    queuedEvents:   [Storyline.schema]
}, {collection: 'characters', discriminatorKey: '_type' });


CharacterSchema.statics.populateString = 'name profession age health body mind soul honor skills armor shield queuedEvents';


CharacterSchema.statics.factory = function (template) {
    "use strict";
    var result = new Character(template);
    this.initialize(template);

    return result;
};

CharacterSchema.methods.initialize = function (template) {
    "use strict";
    if (!template.mind || !template.body || !template.soul) {
        this.generateStats();   // TODO find inheretance pattern
    }
    
    if (template.age >= 14) {this.fertility = true; }
    
    return this;
};

CharacterSchema.methods.generateStats = function () {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0:
        this.bodyType = 'ectomorph';
        this.body = 3;
        this.mind = 5;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Learning', level: 3}));
        break;
    case 1:
        this.bodyType = 'mesomorph';
        this.body = 5;
        this.mind = 3;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Brawling', level: 3}));
        break;
    case 2:
        this.bodyType = 'spiritual ascetic';
        this.body = 3;
        this.mind = 4;
        this.soul = 5;
        this.skills.push(Skill.factory({name: 'Orate', level: 3}));
        break;
    case 3:
        this.bodyType = 'spiritual dunce';
        this.body = 4;
        this.mind = 3;
        this.soul = 5;
        this.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    case 4: // balance
        this.bodyType = 'cygnus';
        this.body = 4;
        this.mind = 4;
        this.soul = 4;
        this.skills.push(Skill.factory({name: 'Religion', level: 3}));
        break;
    }

    this.health = this.body;
    
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
        if (e.filterByTurn(turn, that.satisfies)) {
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
                this.skills.forEach(setExperience);
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

CharacterSchema.methods.increaseSkill = function (name, value) {
    "use strict";
    this.skills.forEach(function (s) {
        s.increase(value);
    });
    
    return this;
};

CharacterSchema.methods.getSkill = function (name) {
    "use strict";
    var result = null;
    this.skills.forEach(function (s) {if (name === s.name) {result = s; } });
    
    return result;
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

CharacterSchema.methods.nextTurn = function (options, game, evs, cb) {
    "use strict";
    var cost = 0;
    evs = evs || [];
    
    this.mergeOptions(options);
    this.clearEvents(game.turn);
    
    switch (game.turn.quarter) {
    case "Winter":
        break;
    case "Spring":
        break;
    case "Summer":
        break;
    case "Fall":
        // age each character a year
        this.increaseAge();

        // experience checks for all family members
        this.skills.forEach(function (s) {s.experienceCheck(); });
        
        cost = this.cost();
        break;
    default:
        break;
    }
    
    this.getEvents(game.turn, evs);
    
    this.save(function (err, doc) {
        if (err) {return err; }
        cb(cost, evs);
    });
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
