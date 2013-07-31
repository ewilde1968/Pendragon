var module; // forward to clear out JSLint errors

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
    timelineEvents: [
        {
            year: 490,
            quarter: 'Winter',
            title: 'Hail and Kill!',
            message: "In the year of Our Lord 490, Britain was ruled by the Uther Pendragon, warlord of the Cymric peoples and king of Albion. As a young knight in Uther's army, can you hold true to your honor and your fealty to your liege lord to uphold the law of the land. Or will you succomb to temptation and bring ruin upon the realm, devil take the hindmost?",
            results: [{label: 'Done', action: 'log'}]
        },
        {
            year: 490,
            quarter: 'Winter',
            title: 'Bandits!',
            message: "Bandits roam the wastes between civilized lands. With your father dead and only you, a young and untested landlord, in charge of the family holding, a rag tag group of ne'er do wells have holed up in a nearby copse. The shire marshal calls you to muster at the Earl's motte and bailey fortress to search for these rapscalions and bring them to justice!",
            results: [
                {label: 'Muster', action: 'next', value: {
                    title: 'Capture',
                    message: 'Ride down the punks.',
                    results: [{label: 'Done', action: 'experience', key: 'Horsemanship' }]
                }
                    },
                {label: 'Ignore', action: 'next', value: {
                    title: 'Ignominy',
                    message: "The marshal leads your peers, the other young knights with whom you were trained, to flush out the bandits. They chase the fleeing bandits through your fields, capturing every last one of them. Your peers, the knights of Hertfordshire, view you as a coward for not daring to face the threat of bandits on your own holdings. Your peasants say nothing, looking sadly at their crops trampled by the knight's horses.",
                    results: [{label: 'Lose Honor', action: 'statChange', key: 'honor', value: -1}]
                }
                    }]
        },
        {
            year: 490,
            quarter: 'Spring',
            message: "Summons to King Uther's Court",
            results: [{label: 'Done', action: 'remove'}]
        }
    ],
    investments: [
        {
            name: 'Manor House',
            income: 0,
            cost: 0,
            maintenance: 0,
            defense: 0,
            hate: 0
        },
        {
            name: 'Ditch and Rampart',
            income: 0,
            cost: 15,
            maintenance: 1,
            defense: 2,
            hate: 0
        },
        {
            name: 'Mill',
            income: 0,
            cost: 15,
            maintenance: 0,
            defense: 0,
            hate: -2
        },
        {
            name: 'Apiary',
            income: 2,
            cost: 2,
            maintenance: 1,
            defense: 0,
            hate: 0
        }
    ]
};

module.exports = defaultObjects;