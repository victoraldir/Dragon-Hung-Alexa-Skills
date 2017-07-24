var alexa = require('alexa-app');

// Define an alexa-app
var app = new alexa.app('dragonhunt');

var dragonTypes = [ 'fire', 'ice', 'undead', 'skeleton', 'golden' ];

app.launch(function(req,res) {
    // Generate a random dragon.
    var randomType = Math.floor((Math.random() * 5)); // 0 - 5
    var hp = Math.floor((Math.random() * 11) + 5); // 5 - 15
    
    // Store the dragon in session.
    var dragon = { type: dragonTypes[randomType], hp: hp };
    res.session('dragon', dragon);

    // Welcome the user.
    res.say('A large ' + dragon.type + ' dragon approaches! What do you want to do?');
    res.shouldEndSession(false);
});

app.intent('look', {
        'slots': {},
        'utterances': ['{look|search|find} {a|} {weapon|sword|}']
    },function(req,res) {
        // The user picked-up a weapon! Set a session variable.
        res.session('hasWeapon', true);

        res.say('You search the cave and find a lance on the ground!');
        res.shouldEndSession(false);
    }
);

app.intent('attack', {
        'slots': { 'DragonType': 'DRAGONTYPE' },
        'utterances': ['{attack|fight|hit|use} {lance|weapon} on {-|DragonType} dragon']
    }, function(req,res) {
        if (!req.session('hasWeapon')) {
            // No weapon yet.
            res.say("You don't have a weapon! Try looking around.");
            res.shouldEndSession(false);
        }
        else {
            // The player has a weapon, it's time to attack.
            var dragon = req.session('dragon');
            if (dragon.type.toLowerCase() != req.slot('DragonType').toLowerCase()) {
                // The player didn't speak the correct dragon type!
                res.say("I don't see a " + req.slot('DragonType') + ' dragon anywhere! Just a ' + dragon.type + ' one.');
                res.shouldEndSession(false);
            }
            else {
                // The correct dragon type was spoken, let's attack!
                dragon.hp -= 2;
                res.session('dragon', dragon);

                if (dragon.hp <= 0) {
                    res.say('You have slain the mighty ' + dragon.type + ' dragon! Congratulations!');
                    res.shouldEndSession(true);
                }
                else {
                    res.say("You attack the " + dragon.type + " dragon with your lance! It has " + dragon.hp + ' HP left!');
                    res.shouldEndSession(false);
                }
            }
        }
    }
);

module.exports = app;