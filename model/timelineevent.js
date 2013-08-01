/*
 * TimelineEvent model
*/
var TimelineEvent, require, module; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TimelineEventSchema = new Schema({
    year:           Number,
    quarter:        String,
    requirements:   [],
    title:          String,
    message:        String,
    isChild:        Boolean,
    results:        []
});


TimelineEventSchema.statics.factory = function (template, subcontainer) {
    "use strict";
    var result = new TimelineEvent({
        year: template.year,
        quarter: template.quarter,
        title: template.title,
        message: template.message,
        isChild: false
    });

    if (template.requirements) {
        template.requirements.forEach(function (r) {
            result.requirements.push(r);
        });
    }

    if (template.results) {
        template.results.forEach(function (r) {
            var innerResult, resultObject = {label: r.label, action: r.action, key: r.key, value: r.value };
            if (resultObject.action === 'next') {
                innerResult = TimelineEvent.factory(resultObject.value, subcontainer);
                if (innerResult) {
                    resultObject.value = innerResult.id;
                    innerResult.isChild = true;
                    if (subcontainer) {subcontainer.push(innerResult); }
                }
            }
            result.results.push(resultObject);
        });
    }

    return result;
};


var TimelineEvent = mongoose.model('TimelineEvent', TimelineEventSchema);
module.exports = TimelineEvent;
