/*
 * Statistic model
*/
/*global export, require, module, console */
var Statistic; // forward to clear out JSLint errors

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    util = require('util');


var levelSetter = function (val) {
    "use strict";
    if ('number' !== typeof val || val < 0 || val < 0) {
        return 0;
    }

    if (val > 10) {
        return 10;
    }
    
    return val;
};


var StatisticSchema = new Schema({
    name:           String,
    level:          { type: Number, set: levelSetter, required: true },
    experience:     Boolean
});


StatisticSchema.statics.factory = function (template) {
    "use strict";
    var result = new Statistic({name: template.name,
                            level: template.level || 0,
                            experience: template.experience || false
                           });
    
    return result;
};

StatisticSchema.methods.increase = function (value) {
    "use strict";
    value = value || 1;

    this.level += value;
    
    return this;
};

StatisticSchema.methods.roll = function (bonus) {
    "use strict";
    var result = 0,
        counter = Math.floor(this.level + (bonus || 0)),
        successLimit = 3;
    
    if (0 === counter) {
        // unskilled action, handicap the possibly one success
        counter = 1;
        successLimit = 4;
    }
    
    while (counter > 0) {
        if (Math.floor(Math.random() * 6) >= successLimit) {result += 1; }
        counter -= 1;
    }
    
    return result;
};

StatisticSchema.methods.difficultyCheck = function (difficulty, bonus) {
    "use strict";
    // Each level in the Statistic is a d6 roll. A success for a die occurs on 4-6.
    // If the number of successes >= difficulty then the check succeeds. If the
    // number of successes is >= difficulty + 3 then the check crits. If the
    // number of success is <= diffuclty - 3 then the check fumbles. Otherwise
    // the check fails.
    var roll = this.roll(bonus),
        result;
    
    console.log("difficulty check");
    console.log(util.inspect(this, {colors: true}));
    console.log("difficulty: %d", difficulty);
    console.log("bonus: %d", bonus);
    console.log("roll: %d", roll);
    
    if (roll < difficulty - 3) {
        result = 'Fumble';
    } else if (roll < difficulty) {
        result = 'Failure';
    } else if (roll < difficulty + 3) {
        result = 'Success';
    } else {
        result = 'Critical Success';
    }
    
    console.log("result: %s", result);
    
    return result;
};

StatisticSchema.methods.experienceCheck = function () {
    "use strict";
    // to increase a Statistic or stat, every die rolled must be a success
    var result;
    
    if (this.experience) {
        result = this.difficultyCheck(this.level, 1);   // get level + 1 dice and must make level to increase skill

        switch (result) {
        case 'Critical Success':
            this.increase();
            break;
        case 'Success':
            this.increase();
            break;
        case 'Failure':
            // do nothing
            break;
        case 'Fumble':
            // do nothing
            break;
        default:
            throw {
                name: 'invalid roll result',
                message: result + ' is invalid'
            };
        }
        
        this.experience = false;
    }

    return this;
};

StatisticSchema.methods.opposedCheck = function (enemyStatistic, bonus, enemyBonus) {
    "use strict";
    var enemyRoll = typeof enemyStatistic === 'Statistic' ? enemyStatistic.roll(enemyBonus || 0) :
                Statistic.factory({level: enemyStatistic}).roll(enemyBonus || 0),
        myRoll = this.roll(bonus || 0),
        result;
    
    console.log("opposed check");
    console.log('This: ', util.inspect(this, {colors: true}));
    console.log('Enemy: ', util.inspect(enemyStatistic, {colors: true}));
    console.log("bonuses: %d vs. %d", bonus, enemyBonus);
    console.log("rolls: %d vs. %d", myRoll, enemyRoll);
    
    if (myRoll < enemyRoll - 3) {
        result = 'Fumble';
    } else if (myRoll < enemyRoll) {
        result = 'Failure';
    } else if (myRoll === enemyRoll) {
        result = 'Tie';
    } else if (myRoll > enemyRoll + 3) {
        result = 'Critical Success';
    } else {
        result = 'Success';
    }
    
    console.log("result: %s", result);
    
    return result;
};


var Statistic = mongoose.model('Statistic', StatisticSchema);
module.exports = Statistic;
