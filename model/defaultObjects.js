var defaultObjects = {
    memeplexes:[
            {name:'Transhumanism',
             locales:['Near Earth Orbit','Tokyo','Singapore'],
             investmentName:'Research',
             monetaryUnit:'₡',
             leaderOdds:['Human','Alpha','Angel','Sapient AI','Cyborg','Android'],
             leadersAtStart:3,
             startingCorporationOdds:['Beyond Robotics','Biohumanity','Publicom'],
             corporationsAtStart:1,
             startingInvestments:['Bioengineering','Nanotechnology','Artificial Intelligence'],
             startingPropaganda:['Secularism','Freedom of Form']
            },
            {name:'Metal Gods',
             locales:['Tokyo','Moscow','Johannesburg'],
             investmentName:'Research',
             monetaryUnit:'₡',
             leaderOdds:['Sapient AI','Cyborg','Cyborg','Android','Android'],
             leadersAtStart:1,
             startingCorporationOdds:['Beyond Robotics','Huedyn Energy','Crandall Data'],
             corporationsAtStart:1,
             startingInvestments:['Nanotechnology','Artificial Intelligence','Energy Efficiency'],
             startingPropaganda:['Secularism','Freedom of Form']
            },
            {name:'Corporate Fascism',
             locales:['New York','Hong Kong','Near Earth Orbit'],
             investmentName:'Lobbying',
             monetaryUnit:'℔',
             leaderOdds:['Natural','Human','Alpha','Sapient AI','Cyborg','Android'],
             leadersAtStart:3,
             startingCorporationOdds:['El Grillo Entertainment','Huedyn Energy','Crandall Data'],
             corporationsAtStart:1,
             startingInvestments:['Nanotechnology','Artificial Intelligence','Bioengineering','Energy Efficiency'],
             startingPropaganda:['Free Market Economy','Consumerism']
            },
            {name:'Sons of Abraham',
             locales:['Rome','Mecca','Jeruselem'],
             investmentName:'Lobbying',
             monetaryUnit:'$',
             leaderOdds:['Natural','Natural','Human','Human','Alpha'],
             leadersAtStart:4,
             startingCorporationOdds:['El Grillo Entertainment','Huedyn Energy','Grumman Group'],
             corporationsAtStart:1,
             startingInvestments:['Nanotechnology','Energy Efficiency','Ecological Rehabilitation'],
             startingPropaganda:['Free Market Economy','Spiritual Awakening']
            },
            {name:'US Nationalism',
             locales:['New York','Los Angeles','Washington DC'],
             investmentName:'Military',
             monetaryUnit:'$',
             leaderOdds:['Natural','Natural','Natural','Human','Human','Alpha'],
             leadersAtStart:3,
             startingCorporationOdds:['El Grillo Entertainment','Huedyn Energy','Grumman Group','Crandall Data'],
             corporationsAtStart:1,
             startingInvestments:['Nanotechnology','Artificial Intelligence','Energy Efficiency','Tactical Weaponry'],
             startingPropaganda:['Free Market Economy','Nationalism']
            },
            {name:'Chinese Nationalism',
             locales:['Beijing','Hong Kong','Shanghai'],
             investmentName:'Military',
             monetaryUnit:'¥',
             leaderOdds:['Natural','Natural','Human','Human','Alpha','Cyborg'],
             leadersAtStart:3,
             startingCorporationOdds:['Erganics','Huedyn Energy','Beyond Robotics'],
             corporationsAtStart:1,
             startingInvestments:['Nanotechnology','Artificial Intelligence','Bioengineering','Tactical Weaponry'],
             startingPropaganda:['Free Market Economy','Nationalism']
            },
            {name:'EU Nationalism',
             locales:['London','Rome','Berlin'],
             investmentName:'Military',
             monetaryUnit:'€',
             leaderOdds:['Natural','Natural','Human','Human','Alpha','Cyborg'],
             leadersAtStart:3,
             startingCorporationOdds:['Publicom','Huedyn Energy','Virgin Aerospace'],
             corporationsAtStart:1,
             startingInvestments:['Energy Efficiency','Artificial Intelligence','Bioengineering','Tactical Weaponry'],
             startingPropaganda:['Free Market Economy','Nationalism']
            },
            {name:'Naturalism',
             locales:['Berlin','Rome','Mecca'],
             investmentName:'Lobbying',
             monetaryUnit:'€',
             leaderOdds:['Natural','Natural','Human'],
             leadersAtStart:4,
             startingCorporationOdds:['Complex Ecosystems Consortium','Huedyn Energy','Crandall Data'],
             corporationsAtStart:1,
             startingInvestments:['Energy Efficiency','Ecological Rehabilitation','Tactical Weaponry'],
             startingPropaganda:['Deep Ecology','Spiritual Awakening']
            },
            {name:'Universal Socialism',
             locales:['Beijing','Johannesburg','Mars'],
             investmentName:'Lobbying',
             monetaryUnit:'¥',
             leaderOdds:['Natural','Human','Alpha','Angel','Sapient AI','Cyborg','Android'],
             leadersAtStart:3,
             startingCorporationOdds:['Publicom','Huedyn Energy','International Workers Union'],
             corporationsAtStart:1,
             startingInvestments:['Energy Efficiency','Bioengineering','Tactical Weaponry'],
             startingPropaganda:['Freedom of Form','Egalitarianism']
            }
        ],
    locales:[
             {name:'New York'
             },
             {name:'Los Angeles'
             },
             {name:'Washington DC'
             },
             {name:'Beijing'
             },
             {name:'Hong Kong'
             },
             {name:'Shanghai'
             },
             {name:'Berlin'
             },
             {name:'Rome'
             },
             {name:'Mecca'
             },
             {name:'Jeruselem'
             },
             {name:'London'
             },
             {name:'Singapore'
             },
             {name:'Tokyo'
             },
             {name:'Moscow'
             },
             {name:'Mars'
             },
             {name:'Johannesburg'
             },
             {name:'Near Earth Orbit'
             }
        ],
    corporations:[
        {name:'Beyond Robotics',
         startingDonation:1000,
         locales:['','']
        },
        {name:'Biohumanity',
         startingDonation:1000,
         locales:['','']
        },
        {name:'Complex Ecosystems Consortium',
         startingDonation:1000,
         locales:['','']
        },
        {name:'El Grillo Entertainment',
         startingDonation:1000,
         locales:['','']
        },
        {name:'Huedyn Energy',
         startingDonation:1000,
         locales:['','']
        },
        {name:'Erganics',        // intelligent clothes grown to omnipresence
         startingDonation:1000,
         locales:['','']
        },
        {name:'Publicom',       // distributed employment grown to massive labor force   
         startingDonation:1000,
         locales:['','']
        },
        {name:'Grumman Group',  // american arms dealer
         startingDonation:1000,
         locales:['','']
        },
        {name:'Tsinitok',       // russian arms dealer
         startingDonation:1000,
         locales:['','']
        },
        {name:'Crandall Data',  // data warehousing giant
         startingDonation:1000,
         locales:['','']
        },
        {name:'Virgin Aerospace',
         startingDonation:1000,
         locales:['','']
        },
        {name:'International Workers Union',
         startingDonation:1000,
         locales:['','']
        }
        ],
    creatureTemplates:[
        {race:'Natural',
         community:'8d10+30',
         management:'10d10',
         charisma:'10d10',
         level:'1d5'
        },
        {race:'Human',
         community:'9d10+10',
         management:'9d10+10',
         charisma:'9d10+10',
         level:'1d5'
        },
        {race:'Alpha',
         community:'10d10',
         management:'8d10+30',
         charisma:'9d10+10',
         level:'1d5'
        },
        {race:'Angel',
         community:'9d10',
         management:'6d10+30',
         charisma:'10d10',
         level:'1d5',
         bonuses:['Zero-G','Low Gravity']
        },
        {race:'Nonsapient AI',
         community:0,
         management:0,
         charisma:'7d10',
         level:'2d3',
         bonuses:['Tireless','High Radiation']
        },
        {race:'Sapient AI',
         community:'3d10',
         management:0,
         charisma:'10d10+20',
         level:'3d3',
         bonuses:['Tireless','High Radiation']
        },
        {race:'Cyborg',
         community:'5d10',
         management:'10d10+30',
         charisma:'10d10+20',
         level:'2d3+1',
         bonuses:['Zero-G','Low Gravity']
        },
        {race:'Android',
         community:'3d10',
         management:'10d10+30',
         charisma:'10d10+20',
         level:'3d3',
         bonuses:['Tireless','High Radiation','Zero-G','Low Gravity']
        }
    ],
    investmentTemplates:[
        {name:'Energy Efficiency'
        },
        {name:'Bioengineering'
        },
        {name:'Tactical Weaponry'
        },
        {name:'Ecological Rehabilitation'
        },
        {name:'Artificial Intelligence'
        },
        {name:'Nanotechnology'
        }
    ],
    propagandaTemplates:[
        {name:'Secularism'
        },
        {name:'Freedom of Form'
        },
        {name:'Free Market Economy'
        },
        {name:'Consumerism'
        },
        {name:'Spiritual Awakening'
        },
        {name:'Nationalism'
        },
        {name:'Deep Ecology'
        },
        {name:'Egalitarianism'
        }
    ]
};

module.exports = defaultObjects;