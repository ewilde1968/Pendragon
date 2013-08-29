/*global export, require, module */

var defaultObjects = {
    sirFamilies: [
        {
            name: 'Langley',
            rank: 'Sir',
            liege: 'Hertford',
            locale: {name: 'Langley Valley'}
        },
        {
            name: 'Chesham',
            rank: 'Sir',
            liege: "Berkhamstead",
            locale: {name: 'Chesham'}
        },
        {
            name: 'Harpenden',
            rank: 'Sir',
            liege: 'Hertford',
            locale: {name: 'Harpenden Wood'}
        }
    ],
    nonPlayerSirFamilies: [
        {
            name: 'High Wycomb',
            rank: 'Sir',
            liege: 'Hertford',
            locale: {name: 'High Wycomb'},
            ladies: [
                {
                    name: 'Morcheidys apf Caramig',
                    age: 16
                }
            ]
        },
        {
            name: 'Borehamwood',
            rank: 'Sir',
            liege: "Hertford",
            locale: {name: 'Borehamwood'}
        },
        {
            name: 'Knebworth',
            rank: 'Sir',
            liege: 'Hertford',
            locale: {name: 'Knebworth'},
            patriarch: false,
            ladies: [
                {
                    name: 'Obilot of Knebworth',
                    age: 28
                }
            ]
        }
    ],
    lordFamilies: [
        {
            name: 'Berkhamstead',
            rank: 'Knight Banneret',
            liege: 'Hertford',
            locale: {name: 'Berkhamstead'}
        },
        {
            name: 'Hemel Hempstead',
            rank: 'Knight Banneret',
            patriarch: 'Caramig ap Blelyd',
            liege: 'Hertford',
            locale: {name: 'Hemel Hempstead'}
        },
        {
            name: 'Sains',
            rank:   'Knight Banneret',
            patriarch: 'Galwyrn',
            liege: 'Cornouailles',
            locale: {name: 'Sains'},
            ladies: [
                {
                    name: 'Gwenhwyfar of Brittany',
                    age: 17
                }
            ]
        }
    ],
    peerFamilies: [
        {
            name: 'Hertford',
            rank: 'Earl',
            patriarch: 'Aralyd',
            liege: 'Pendragon',
            locale: {name: 'Hertford Castle'},
            ladies: [
                {
                    name: 'Elaine apf Aralyd',
                    age: 17
                }
            ]
        },
        {
            name: 'Caercolun',
            rank: 'Duke',
            patriarch: 'Lucius',
            liege: 'Pendragon',
            locale: {name: 'Caercolun'},
            extended: [
                {
                    name: 'Elmig ap Lucius',
                    family: 'Caercolun'
                }
            ]
        }
    ],
    kingFamilies: [
        {
            name: 'Pendragon',
            rank: 'King',
            patriarch: 'Uther',
            locale: {name: 'White Castle of London'}
        }
    ],
    bachelorKnights: [
        {
            name: 'Gerdig',
            rank: 'Bachelor',
            liege: 'Hertford',
            patriarch: 'Aragore ap Gerdig',
            ladies: [
                {
                    name: 'Feunette',
                    age: 15
                }
            ]
        }
    ],
    courts: [
        {
            year: 485,
            season: 'Spring',
            name: 'Pentacost Court',
            presiding: 'liege',
            locale: 'liege',
            guests: {vassals: true,
                     'Elmig ap Lucius': true,
                     'Elaine apf Aralyd': true,
                     'Morcheidys apf Caramig': true,
                     'Obilot of Knebworth': true,
                     'Gwenhwyfar of Brittany': true,
                     'Feunette': true
                    },
            news: {
                'Elmig ap Lucius': 'Spies from Essex say another Saxon army has landed in the east! He is King Aethelswith, and he is amassing troops along the roads to the north. My father, Duke Caercolun, is ready and will drive these demons back; but, we have need of more knights at our side.',
                'Hertford': "We muster for King Uther in two weeks at Salisbury. We go south to fight King Aelle as Uther Pendragon commands. Duke Caercolun must needs hold off Aethelswith's Saxon hordes to the east of his own accord."
            },
            gossip: "\"The Saxons are at our gate! Who's to know the heart of a devil? Duke Lucius' son says they're traveling north; but, I say they'll be coming straight to our shire instead! Whither shall we flee?\"\r\n\"Flee, loves? Nay. Sir Elmig knows what he says and those brutes will march to Caercolun this summer.\"\r\n\"Then do you think we should send our knights to the Duke? I hear a whole new fleet of them have arrived this winter. How can the Duke survive such an onslought?\"\r\n\"King Uther is asking for all worthy squires to be knighted early this spring so that he has men to fight against the Saxons himself. I think the Earl will ride with the King! How could he do otherwise?\"\r\n\"Aye, so do I. But will Cornwall come as well? He has the best nights in the land, second to our own Earl of course; but he's not answered the King's muster in two years now.\"",
            intrigue: {Fumble: "\"Earl Aralyd's daughter Ilaine is madly in love with Sir Elmig. She begged the Earl to serve Sir Elmig at the Pentecost feast personally.\"",
                       Success: "\"Merlin is absent because he is so exhausted from using so much magic last year to help King Uther win a victory in the Battle of Damen. But the king has promised to help Duke Ulfius of Silchester.\"\r\n\"You do know, don’t you, that the mages must sleep when they use their powers to such a great extent? And the king is so impetuous without the magician’s guidance. I hope he is not acting too hastily!\"",
                       'Critical Success': "Gagyr ap Agragore, the praetor of Royston, is absent this Pentecost because he spends more time with Earl Huntington than Earl Hertford. Rumor has it that the praetor's daughter will marry Earl Huntington's eldest son."},
            friday: {
                morning: {activity: 'none'},
                evening: {activity: 'none'}
            },
            saturday: {
                morning: {
                    activity: 'hunting',
                    opportunities: [
                        {'Elmig ap Lucius': 'Befriend Caercolun'},
                        {'Aragore ap Gerdig': 'Offer Feunette'}
                    ]
                },
                evening: {
                    activity: 'feast',
                    opportunities: [
                        {'Aragore ap Gerdig': 'Offer Feunette'}
                    ]
                }
            },
            sunday: {
                morning: {
                    activity: 'knighting',
                    opportunities: [
                        {'Aragore ap Gerdig': 'Offer Feunette'}
                    ]
                },
                evening: {
                    activity: 'feast',
                    opportunities: [
                        {'Hemel Hempstead': 'Riding Under the Marshal'},
                        {'Aragore ap Gerdig': 'Offer Feunette'}
                    ]
                }
            }
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
                    actions: {experience: 'Horsemanship', target: 'patriarch'},
                    choices: [{label: 'Done'}]
                },
                {
                    label: 'Ignore',
                    title: 'Ignore Muster',
                    message: "The marshal leads your peers, the other young knights with whom you were trained, to flush out the bandits. They chase the fleeing bandits through your fields, capturing every last one of them. Your peers, the knights of Hertfordshire, view you as a coward for not daring to face the threat of bandits on your own holdings. Your peasants say nothing, looking sadly at their crops trampled by the knight's horses.",
                    actions: {honor: -1, target: 'patriarch'},
                    choices: [{label: 'Ignominy'}]
                }
            ]
        },
        {
            name: "Certher's Wake",
            year: 485,
            quarter: 'Fall',
            title: "Sir Certher's Wake",
            message: "The lord of High Wycomb's wounds from the Battle of Mecred's Burnsted rotted and turned gangrenous. Alas; but, he succumbed to fever during harvest season. The knights of Hertford are invited to attend a wake hosted by his surviving daughter at the family manor in High Wycomb.",
            actions: {log: true},
            choices: [
                {
                    label: 'Attend Wake',
                    title: 'Wolves',
                    message: 'Yeah, baby. Feral!',
                    actions: {experience: 'Spear', target: 'patriarch'},
                    choices: [{label: 'Done'}]
                },
                {label: 'Ignore'}
            ]
        },
        {
            name: 'Faire',
            quarter: 'Summer',
            message: "Peasants, craftsmen and traders from villages for miles around crowd to your lands so to sell and buy all manner of wares.",
            actions: {hate: -1, target: 'Locale'},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Tournament',
            quarter: 'Summer',
            message: "Doh!",
            actions: {hate: -2, target: 'Locale'},
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
            actions: {hate: -2, target: 'Locale'},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Ditch and Rampart Built',
            quarter: 'Fall',
            message: "The village elders nod in agreement with your wise choice. The women and livestock are more easily protected behind a wall.",
            actions: {defense: 2},
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
        },
        {
            name: 'revolt',
            title: 'Simmering Revolt',
            message: 'Oh, bother.',
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'population',
            title: 'Steamy',
            message: 'And stinky too.',
            actions: {log: true},
            choices: [{label: 'Done'}]
        },
        {
            name: 'Angry',
            title: 'Feud',
            message: 'And deadly too.',
            actions: {log: true},
            choices: [{label: 'Done'}]
        }
    ]
};

module.exports = defaultObjects;