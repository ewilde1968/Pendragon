/*
 * Investment model
*/
/*global export, require, module */

var Investment; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Storyline = require('./storyline'),
    Skill = require('./skill');

var InvestmentSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    maintenance:    Number,
    defense:        Number,
    hate:           Number,
    goodEvents:     [String],
    badEvents:      [String],
    built:          Boolean,
    damaged:        Boolean
});


InvestmentSchema.statics.factory = function (template) {
    "use strict";
    var result = new Investment({name: template.name,
                                 income: template.income || 0,
                                 cost: template.cost || 0,
                                 maintenance: template.maintenance || 0,
                                 defense: template.defense || 0,
                                 hate: template.hate || 0,
                                 built: template.built || false,
                                 damaged: template.damaged || false
                                });
    
    template.goodEvents.forEach(function (ge) {result.goodEvents.push(ge); });
    
    return result;
};

InvestmentSchema.methods.determineYearEvents = function (cb) {
    "use strict";
    var luck,
        eventList = null,
        eventName;
    
    if (this.built) {
        luck = Math.floor(Math.random() * 10);

        if (luck === 0 && this.goodEvents && this.goodEvents.length > 0) {
            eventList = this.goodEvents;
        } else if (luck === 9 && this.badEvents && this.badEvents.length > 0) {
            eventList = this.badEvents;
        }

        if (eventList) {
            Storyline.findOne({name: eventList[Math.floor(Math.random() * eventList.length)]},
                              function (err, ev) {
                    if (err) {return err; }
                    if (cb) {cb(ev); }
                });
            
            // return now so that the callback isn't called too early
            return this;
        }
    }

    if (cb) {cb(); }
    
    return this;
};

InvestmentSchema.methods.harvest = function (check) {
    "use strict";
    var result = 0;
    
    if (this.built && !this.damaged) {
        switch (check) {
        case 'Critical Success':
            result = this.income * 2;
            break;
        case 'Success':
            result = this.income;
            break;
        case 'Failure':
            result = Math.floor(this.income / 2);
            break;
        case 'Fumble':
            result = Math.floor(this.income / 4);
            break;
        default:
            throw {
                name: 'Invalid investment harvest check',
                message: check
            };
        }
    }
        
    return result;
};


var Investment = mongoose.model('Investment', InvestmentSchema);
module.exports = Investment;
