/*
 * Character model
*/
var Character, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    TimelineEvent = require('./timelineevent');

var CharacterSchema = new Schema({
    name:           { type: String, required: true, index: true },
    profession:     { type: String, required: true },
    age:            Number,
    health:         String,
    body:           String,
    mind:           String,
    spirit:          String,
    skills:         [Skill.schema],
    armor:          String,
    shield:         Boolean,
    horses:         [{name: String, breed: String, barding: String, health: String}],
    queuedEvents:   [TimelineEvent.schema]
});


var generateStats = function (character) {
    "use strict";
    var focus = Math.floor(Math.random() * 5);
    switch (focus) {
    case 0: // ectomorph
        character.body = Character.descriptions[3];
        character.mind = Character.descriptions[5];
        character.spirit = Character.descriptions[4];
        character.skills.push(Skill.factory({name: 'Learning', level: Skill.descriptions[3]}));
        break;
    case 1: // mesomorph
        character.body = Character.descriptions[5];
        character.mind = Character.descriptions[3];
        character.spirit = Character.descriptions[4];
        character.skills.push(Skill.factory({name: 'Brawling', level: Skill.descriptions[3]}));
        break;
    case 2: // spiritual ascetic
        character.body = Character.descriptions[3];
        character.mind = Character.descriptions[4];
        character.spirit = Character.descriptions[5];
        character.skills.push(Skill.factory({name: 'Orate', level: Skill.descriptions[3]}));
        break;
    case 3: // spiritual dunce
        character.body = Character.descriptions[4];
        character.mind = Character.descriptions[3];
        character.spirit = Character.descriptions[5];
        character.skills.push(Skill.factory({name: 'Religion', level: Skill.descriptions[3]}));
        break;
    case 4: // balance
        character.body = Character.descriptions[4];
        character.mind = Character.descriptions[4];
        character.spirit = Character.descriptions[4];
        character.skills.push(Skill.factory({name: 'Religion', level: Skill.descriptions[3]}));
        break;
    }
};

CharacterSchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Character(template);
    if (!template.mind || !template.body || !template.spirit) {
        generateStats(result);
    }

    if (firstKnight) {
        result.fatherHistory();
    }

    switch (result.profession) {
    case 'Knight':
        if (!template.age) {result.age = 21; }
        result.spirit = Character.descriptions[Character.descriptions.indexOf(result.spirit) - 1];
        result.body = Character.descriptions[Character.descriptions.indexOf(result.body) + 1];
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: Skill.descriptions[3]}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: Skill.descriptions[3]}));
        result.skills.push(Skill.factory({name: 'Spear', level: Skill.descriptions[3]}));
        result.armor = 'Chain Hauberk';
        result.shield = true;
        break;
    case 'Lady':
        if (!template.age) {result.age = 16; }
        result.spirit = Character.descriptions[Character.descriptions.indexOf(result.spirit) + 1];
        result.body = Character.descriptions[Character.descriptions.indexOf(result.body) - 1];
        result.skills.push(Skill.factory({name: 'Steward', level: Skill.descriptions[3]}));
        break;
    case 'Squire':
        if (!template.age) {result.age = 16; }
        result.spirit = Character.descriptions[Character.descriptions.indexOf(result.spirit) - 1];
        // will add to body when they reach 21
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: Skill.descriptions[1]}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: Skill.descriptions[1]}));
        result.skills.push(Skill.factory({name: 'Spear', level: Skill.descriptions[1]}));
        break;
    case 'Steward':
        if (!template.age) {result.age = 21; }
        result.skills.push(Skill.factory({name: 'Steward', level: Skill.descriptions[3]}));
        result.skills.push(Skill.factory({name: 'Swordsmanship', level: Skill.descriptions[1]}));
        result.skills.push(Skill.factory({name: 'Horsemanship', level: Skill.descriptions[1]}));
        result.skills.push(Skill.factory({name: 'Spear', level: Skill.descriptions[1]}));
        break;
    default:
        throw 'Invalid Character profession setting';
    }

    result.health = result.body;

    return result;
};

CharacterSchema.statics.descriptions = ['Dead', 'Infirm', 'Feeble', 'Weak', 'Normal', 'Strong', 'Superlative', 'Mythic'];

CharacterSchema.methods.fatherHistory = function () {
    "use strict";
};

CharacterSchema.methods.satisfies = function (requirements) {
    "use strict";
    return true;    // TODO
};

CharacterSchema.methods.getEvents = function (turn, result) {
    "use strict";
    if (!result) {result = []; }

    var qe = this.queuedEvents[turn.year];
    if (qe && qe.length > 0) {
        qe.forEach(function (e, i, a) {
            if (e.quarter === turn.quarter && this.satisfies(e.requirements)) {
                result.push(e);
                a.splice(i, 1);
            }
        });
    }
};


var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
