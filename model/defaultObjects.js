/*global export, require, module */

var defaultObjects = {
    families: [
        {
            name: 'Langley',
            locale: {name: 'Langley Valley'}
        },
        {
            name: 'Chesham',
            locale: {name: 'Chesham'}
        },
        {
            name: 'Harpenden',
            locale: {name: 'Harpenden Wood'}
        }
    ],
    investments: [
        {
            name: 'Manor House',
            income: 0,
            cost: 0,
            maintenance: 0,
            goodEvents: ['Family Hierloom for Purchase', 'Lost Cousin'],
            badEvents: ['Death in the family', 'Peasant Miscreance']
        },
        {
            name: 'Ditch and Rampart',
            income: 0,
            cost: 15,
            maintenance: 1,
            goodEvents: [],
            badEvents: []
        },
        {
            name: 'Mill',
            income: 0,
            cost: 15,
            maintenance: 0,
            goodEvents: ['New Millstone'],
            badEvents: ['Explosion']
        },
        {
            name: 'Apiary',
            income: 2,
            cost: 2,
            maintenance: 1,
            goodEvents: ['Wild Peaches'],
            badEvents: ['Bee Fungus']
        }
    ],
    feasts: [
        {
            name: 'Faire',
            cost: 5
        },
        {
            name: 'Horse Race',
            cost: 3
        },
        {
            name: 'Tournament',
            cost: 15
        }
    ],
    eventTree: [
        {
            name: 'Intro',
            year: 485,
            quarter: 'Winter',
            title: 'Hail and Kill!',
            message: 'In the year of Our Lord 485, Britain was ruled by the Uther Pendragon, warlord of the Cymric peoples and king of Albion. As a young knight in Uther\'s army, can you hold true to your honor and your fealty to your liege lord to uphold the law of the land? Or will you succomb to temptation and bring ruin upon the realm, devil take the hindmost?',
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Tutorial Challenge',
            year: 485,
            quarter: 'Winter',
            title: 'Bandits!',
            message: "Bandits roam the wastes between civilized lands. With your father dead and only you, a young and untested landlord, in charge of the family holding, a rag tag group of ne'er do wells have holed up in a nearby copse. The shire marshal calls you to muster at the Earl's motte and bailey fortress to search for these rapscalions and bring them to justice!",
            actions: {log: true},
            choices: [
                {
                    label: 'Muster',
                    title: 'Captured',
                    message: 'Ride down the punks.',
                    actions: {experience: 'Horsemanship'},
                    choices: [{label: 'Done'}]
                },
                {
                    label: 'Ignore',
                    title: 'Ignore Muster',
                    message: "The marshal leads your peers, the other young knights with whom you were trained, to flush out the bandits. They chase the fleeing bandits through your fields, capturing every last one of them. Your peers, the knights of Hertfordshire, view you as a coward for not daring to face the threat of bandits on your own holdings. Your peasants say nothing, looking sadly at their crops trampled by the knight's horses.",
                    actions: {honor: -1},
                    choices: [{label: 'Ignominy'}]
                }
            ]
        },
        {
            name: '485 Pentecost Summons',
            year: 485,
            quarter: 'Spring',
            message: "Summons to King Uther's Court",
            choices: [{label: 'Done'}]
        },
        {
            name: 'Faire',
            quarter: 'Summer',
            message: "Peasants, craftsmen and traders from villages for miles around crowd to your lands so to sell and buy all manner of wares.",
            actions: {log: true, hate: -1},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Tournament',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true, hate: -2},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Horse Race',
            quarter: 'Spring',
            message: "Squires and knights from across the county come with their fastest horses to try their skill along the paths outside your holding.",
            actions: {log: true},
            choices: [
                {
                    title: 'Enter race yourself',
                    message: 'Win the Purse!',
                    label: 'Enter race yourself',
                    actions: {log: true, cash: 2},
                    choices: [{label: 'Collect'}]
                },
                {
                    title: 'Bet on another rider',
                    message: 'Lose your bet.',
                    label: 'Bet on another rider',
                    actions: {log: true, cash: -2},
                    choices: [{label: 'Pay Out'}]
                }
            ]
        },
        {
            name: 'Manor House Built',
            quarter: 'Fall',
            title: 'Manor House Built',
            message: "Rejoice and be glad, for hearth and home are restored.",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Mill Built',
            quarter: 'Fall',
            message: "Your peasants rest more easily this winter knowing the grainstocks are ground and stored away from molds.",
            actions: {log: true, hate: -2},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Ditch and Rampart Built',
            quarter: 'Fall',
            message: "The village elders nod in agreement with your wise choice. The women and livestock are more easily protected behind a wall.",
            actions: {log: true, defense: 2},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Family Hierloom for Purchase',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Lost Cousin',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Death in the family',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Peasant Miscreance',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'New Millstone',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Explosion',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Wild Peaches',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Bee Fungus',
            quarter: 'Summer',
            message: "Doh!",
            actions: {log: true},
            choices: [{label: 'Done'}]
        }
    ]
};

module.exports = defaultObjects;