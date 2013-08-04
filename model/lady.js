/*
 * Lady model
*/
var Lady, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Skill = require('./skill'),
    Character = require('./character');

var LadySchema = Character.schema.extend({
    children:       [Character.schema]
});


LadySchema.statics.factory = function (template, firstKnight) {
    "use strict";
    var result = new Lady(template);
    result.initialize(template);

    return result;
};

LadySchema.mehods.initialize = function (template) {
    "use strict";
    this.prototype.initialize(template);
    
    this.profession = 'Lady';

    this.age = template.age || 16;
    this.fertility = template.fertility || (this.age > 14 && this.age < 38);
    this.soul += 1;
    this.body -= 1;
    this.honor = 4;
    this.skills.push(Skill.factory({name: 'Stewardry', level: 3}));

    return this;
};

LadySchema.methods.increaseAge = function () {
    "use strict";
    this.prototype.increaseAge();

    if (this.age >= 38) {
        // menopause
        this.fertility = false;
    }
    
    return this;
};


var Lady = mongoose.model('Lady', LadySchema);
module.exports = Lady;
