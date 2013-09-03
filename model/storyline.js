/*
 * Storyline model
*/
/*global export, require, module */
var Storyline; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var StorylineSchema = new Schema();
StorylineSchema.add({
    name:           { type: String, index: true },
    isTemplate:     Boolean,
    year:           Number,
    quarter:        String,
    requirements:   [],
    title:          String,             // title in display of event
    message:        String,
    label:          String,             // button label for sub events
    actions:        String,             // JSON object string, array of actions to take
    choices:        [StorylineSchema]
});


StorylineSchema.statics.factory = function (template, isTemplate) {
    "use strict";
    var result = new Storyline({
        name:       template.name,
        year:       template.year,
        quarter:    template.quarter,
        title:      template.title || '',
        message:    template.message || '',
        label:      template.label,
        isTemplate: isTemplate
    });

    if (template.requirements) {
        template.requirements.forEach(function (r) {result.requirements.push(r); });
    }

    if (template.actions) {
        if ('string' === typeof template.actions) {
            result.actions = template.actions;
        } else {
            result.actions = JSON.stringify(template.actions);
        }
    }

    if (template.choices) {
        template.choices.forEach(function (r) {
            var resultEvent = Storyline.factory(r);
            result.choices.push(resultEvent);
        });
    }

    return result;
};

StorylineSchema.methods.filterByTurn = function (turn, satisfies) {
    "use strict";
    if ((!this.year || this.year === turn.year)
            && (!this.quarter || this.quarter === turn.quarter)
            && (!satisfies || satisfies(this))) {
        return true;
    }
    
    return false;
};

StorylineSchema.methods.setFutureTime = function (thisTurn, years, seasons) {
    "use strict";
    this.year = thisTurn.year + years + Math.floor(seasons / 4);
    this.quarter = thisTurn.quarter;

    seasons = seasons % 4;

    while (seasons) {
        switch (this.quarter) {
        case 'Winter':
            this.quarter = 'Spring';
            break;
        case 'Spring':
            this.quarter = 'Summer';
            break;
        case 'Summer':
            this.quarter = 'Fall';
            break;
        case 'Fall':
            this.quarter = 'Winter';
            this.year += 1;
            break;
        }
        seasons -= 1;
    }
};


var Storyline = mongoose.model('Storyline', StorylineSchema);
module.exports = Storyline;
