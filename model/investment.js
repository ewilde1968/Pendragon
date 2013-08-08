/*
 * Investment model
*/
/*global export, require, module */

var Investment; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Storyline = require('./storyline');

var InvestmentSchema = new Schema({
    name:           { type: String, required: true },
    income:         Number,
    cost:           Number,
    maintenance:    Number,
    defense:        Number,
    hate:           Number,
    goodEvents:     [Storyline.schema],
    badEvents:      [Storyline.schema],
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
    
    return result;
};

InvestmentSchema.methods.determineYearEvents = function (cb) {
    "use strict";
    var luck,
        eventList = null;
    
    if (this.built) {
        luck = Math.floor(Math.random() * 20);

        if (luck === 0 && this.goodEvents && this.goodEvents.length > 0) {
            eventList = this.goodEvents;
        } else if (luck === 19 && this.badEvents && this.badEvents.length > 0) {
            eventList = this.badEvents;
        }

        if (eventList) {
            Storyline.findOne({name: eventList[Math.floor(Math.random() * eventList.length)]},
                              function (err, ev) {
                    if (err) {return err; }
                    if (cb) {cb(err, Storyline.factory(ev)); }
                });
        }
    }

    return this;
};

InvestmentSchema.methods.harvest = function (steward, eventQueue) {
    "use strict";
    var result = -this.cost,
        luck = Math.floor(Math.random() * 20),
        d6 = function () {return Math.floor(Math.random() * 6); },
        weather = d6() + d6() + d6() + 5,
        harvest;
    
    if (this.built) {
        harvest = luck + steward.getSkill('Stewardry').level * 2 - weather;
        if (harvest >= 10) {
            result += this.income * 2;      // critical success
        } else if (harvest >= 0) {
            result += this.income;          // normal success
        } else if (harvest >= -10) {
            result += this.income / 2;      // normal failure, critical failure = no income
        }

        result -= this.maintenance;
    }
    
    return result;
};


var Investment = mongoose.model('Investment', InvestmentSchema);
module.exports = Investment;
