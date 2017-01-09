"use strict";

var D2_API_KEY="CF1A4219A8407493ABAD29C0614BEE53";
var dota2_webapi_url="http://api.steampowered.com/IEconDOTA2_570";
var dota2_webapi_url_heroes = dota2_webapi_url + "/GetHeroes/v1?key=" + D2_API_KEY + "&language=en";
var dota2_webapi_url_items = dota2_webapi_url + "/GetGameItems/v1?key=" + D2_API_KEY + "&language=en";
var dota2_base_image_url = "http://cdn.dota2.com/apps/dota2/images";
var dota2_base_image_url_heroes = dota2_base_image_url + "/heroes/";
var dota2_base_image_url_items = dota2_base_image_url + "/items/";

var jsfeed_heropickerdata_url = "http://www.dota2.com/jsfeed/heropickerdata";
var jsfeed_abilitydata_url = "http://www.dota2.com/jsfeed/abilitydata";
var jsfeed_itemdata_url = "http://www.dota2.com/jsfeed/itemdata";
var jsfeed_heropediadata_url = "http://www.dota2.com/jsfeed/heropediadata";

var dotabuff_heroes_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json";
var dotabuff_abilities_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json";
var dotabuff_items_url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/items.json";

class Hero{
  constructor() {
    // Name
    this.name = "";
    this.short_name = "";
    this.localized_name = "";

    // Image
    this.icon_url = "";
    this.portrait_url = "";
    this.small_horizontal_portrait = "";
    this.large_horizontal_portrait = "";
    this.full_quality_horizontal_portrait = "";
    this.full_quality_vertical_portrait = "";

    // Stat
    this.armorPhysical = -1;
    this.magicalResistance = 25;
    this.attackDamageMin = 1;
    this.attackDamageMax = 1;
    this.attackRate = 1.7;
    this.attackAnimationPoint = 0.75;
    this.attackAcquisitionRange = 800;
    this.attackRange = 600;
    this.attributePrimary = "DOTA_ATTRIBUTE_STRENGTH";
    this.attributeBaseStrength = 0;
    this.attributeStrengthGain = 0;
    this.attributeBaseIntelligence = 0;
    this.attributeIntelligenceGain = 0;
    this.attributeBaseAgility = 0;
    this.attributeAgilityGain = 0;
    this.movementSpeed = 300;
    this.movementTurnRate = 0.500000;
    // this.statusHealth = 200;
    // this.statusHealthRegen = 0.250000;
    // this.statusMana = 50;
    // this.statusManaRegen = 0.010000;
    this.visionDaytimeRange = 1800;
    this.visionNighttimeRange = 800;

    // Abilities
    this.abilities = [];

    // Others
    this.role = "";
    this.team = "Good";
    this.legs = 2;
    this.lore = "";
  }
}

class Ability{
  constructor() {
    this.id = "";
    this.key = "";
    this.name = "";
    this.full_name = "";
    this.affects = "";
    this.description = "";
    this.notes = "";
    this.lore = "";
  }
}

class Item{

}

function returnJSON(res, data) {
  console.log("Getting data is done!");
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}

var express = require('express');
var app = express();
var request = require('request');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/heroes', function(req, res) {
  // Get hero list from official web api of dota 2 to ensure data is newest
  var url = dota2_webapi_url_heroes;
  console.log("Get data from " + url + "...");
  request(url, function(error, response, data) {
    if (error) {
      return console.log(error);
    }
    if (response.statusCode !== 200) {
      return console.log(response.statusCode);
    }
    // console.log(data);
    // console.log("Getting data from " + url + " is done!");
    data = JSON.parse(data);
    // console.log(data.result.status);
    if (data.result.status === 200) {
      var heroes = [];
      for (var record of data.result.heroes) {
        // console.log(record.name);
        var hero = new Hero();
        hero.name = record.name;
        // Remove "npc_dota_hero_" from name
        hero.short_name = record.name.replace("npc_dota_hero_", "");
        hero.localized_name = record.localized_name;

        // Add image url for each hero
        // 59x33px
        hero.small_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_sb.png";
        // 205x11px
        hero.large_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_lg.png";
        // 256x114px
        hero.full_quality_horizontal_portrait = dota2_base_image_url_heroes + hero.short_name + "_full.png";
        // 234x272px
        hero.full_quality_vertical_portrait = dota2_base_image_url_heroes + hero.short_name + "_vert.jpg";
        hero.icon_url = hero.small_horizontal_portrait;
        hero.portrait_url = hero.full_quality_vertical_portrait;

        // Push data of new hero to end of the array
        heroes.push(hero);
      }

      // Ensure there is at least one hero
      if (heroes.length) {
        var counter = 2; // A counter used to ensure we collected all data
        // Get bio of each hero from http://www.dota2.com/jsfeed/heropickerdata
        url = jsfeed_heropickerdata_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            return console.log(error);
          }
          if (response.statusCode !== 200) {
            return console.log(response.statusCode);
          }
          // console.log("Getting data from " + url + " is done!");
          data = JSON.parse(data);
          // console.log(heroes.length);
          heroes.forEach(function(hero, index) {
            if (data[hero.short_name]) {
              heroes[index].lore = data[hero.short_name].bio;
            }
          });
          counter--;
          if (counter == 0) {
            returnJSON(res, heroes);
          }
        });

        // Get information of abilities from http://www.dota2.com/jsfeed/abilitydata
        var abilities = {};
        url = jsfeed_abilitydata_url;
        console.log("Get data from " + url + "...");
        request(url, function(error, response, data) {
          if (error) {
            return console.log(error);
          }
          if (response.statusCode !== 200) {
            return console.log(response.statusCode);
          }
          // console.log("Getting data from " + url + " is done!");
          abilities = (JSON.parse(data)).abilitydata;

          // Get information of abilities from https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json
          url = dotabuff_abilities_url;
          console.log("Get data from " + url + "...");
          request(url, function(error, response, data) {
            if (error) {
              console.log(error);
            }
            if (response.statusCode !== 200) {
              console.log(response.statusCode);
            }
            data = JSON.parse(data);
            // abilities.forEach(function(ability, index) {
            for (var key in abilities) {
              if (data.DOTAAbilities[key] && data.DOTAAbilities[key].ID) {
                abilities[key].id = data.DOTAAbilities[key].ID;
              }
            }
            // });
            // Get information of each hero from https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json
            url = dotabuff_heroes_url;
            console.log("Get data from " + url + "...");
            request(url, function(error, response, data) {
              if (error) {
                return console.log(error);
              }
              if (response.statusCode !== 200) {
                return console.log(response.statusCode);
              }
              // console.log("Getting data from " + url + " is done!");
              data = JSON.parse(data);
              heroes.forEach(function(hero, index) {
                if (data.DOTAHeroes[hero.name]) {
                  if (data.DOTAHeroes[hero.name].ArmorPhysical)
                    heroes[index].armorPhysical = Number(data.DOTAHeroes[hero.name].ArmorPhysical);
                  if (data.DOTAHeroes[hero.name].MagicalResistance)
                    heroes[index].magicalResistance = Number(data.DOTAHeroes[hero.name].MagicalResistance);
                  if (data.DOTAHeroes[hero.name].AttackDamageMin)
                    heroes[index].attackDamageMin = Number(data.DOTAHeroes[hero.name].AttackDamageMin);
                  if (data.DOTAHeroes[hero.name].AttackDamageMax)
                    heroes[index].attackDamageMax = Number(data.DOTAHeroes[hero.name].AttackDamageMax);
                  if (data.DOTAHeroes[hero.name].AttackRate)
                    heroes[index].attackRate = Number(data.DOTAHeroes[hero.name].AttackRate);
                  if (data.DOTAHeroes[hero.name].AttackAnimationPoint)
                    heroes[index].attackAnimationPoint = Number(data.DOTAHeroes[hero.name].AttackAnimationPoint);
                  if (data.DOTAHeroes[hero.name].AttackAcquisitionRange)
                    heroes[index].attackAcquisitionRange = Number(data.DOTAHeroes[hero.name].AttackAcquisitionRange);
                  if (data.DOTAHeroes[hero.name].AttackRange)
                    heroes[index].attackRange = Number(data.DOTAHeroes[hero.name].AttackRange);
                  if (data.DOTAHeroes[hero.name].AttributePrimary) {
                    switch (data.DOTAHeroes[hero.name].AttributePrimary) {
                      case "DOTA_ATTRIBUTE_STRENGTH":
                        heroes[index].attributePrimary = "STRENGTH";
                        break;
                      case "DOTA_ATTRIBUTE_AGILITY":
                        heroes[index].attributePrimary = "AGILITY";
                        break;
                      case "DOTA_ATTRIBUTE_INTELLECT":
                        heroes[index].attributePrimary = "INTELLECT";
                        break;
                      default:
                        heroes[index].attributePrimary = "Unknown";
                        break;
                    }
                  }
                  if (data.DOTAHeroes[hero.name].AttributeBaseStrength)
                    heroes[index].attributeBaseStrength = Number(data.DOTAHeroes[hero.name].AttributeBaseStrength);
                  if (data.DOTAHeroes[hero.name].AttributeStrengthGain)
                    heroes[index].attributeStrengthGain = Number(data.DOTAHeroes[hero.name].AttributeStrengthGain);
                  if (data.DOTAHeroes[hero.name].AttributeBaseIntelligence)
                    heroes[index].attributeBaseIntelligence = Number(data.DOTAHeroes[hero.name].AttributeBaseIntelligence);
                  if (data.DOTAHeroes[hero.name].AttributeIntelligenceGain)
                    heroes[index].attributeIntelligenceGain = Number(data.DOTAHeroes[hero.name].AttributeIntelligenceGain);
                  if (data.DOTAHeroes[hero.name].AttributeBaseAgility)
                    heroes[index].attributeBaseAgility = Number(data.DOTAHeroes[hero.name].AttributeBaseAgility);
                  if (data.DOTAHeroes[hero.name].AttributeAgilityGain)
                    heroes[index].attributeAgilityGain = Number(data.DOTAHeroes[hero.name].AttributeAgilityGain);
                  if (data.DOTAHeroes[hero.name].MovementSpeed)
                    heroes[index].movementSpeed = Number(data.DOTAHeroes[hero.name].MovementSpeed);
                  if (data.DOTAHeroes[hero.name].MovementTurnRate)
                    heroes[index].movementTurnRate = Number(data.DOTAHeroes[hero.name].MovementTurnRate);
                  if (data.DOTAHeroes[hero.name].VisionDaytimeRange)
                    heroes[index].visionDaytimeRange = Number(data.DOTAHeroes[hero.name].VisionDaytimeRange);
                  if (data.DOTAHeroes[hero.name].VisionNighttimeRange)
                    heroes[index].visionNighttimeRange = Number(data.DOTAHeroes[hero.name].VisionNighttimeRange);
                  if (data.DOTAHeroes[hero.name].Role)
                    heroes[index].role = data.DOTAHeroes[hero.name].Role;
                  if (data.DOTAHeroes[hero.name].Team) {
                    switch (data.DOTAHeroes[hero.name].Team) {
                      case "Good":
                        heroes[index].team = "Radiant";
                        break;
                      case "Bad":
                        heroes[index].team = "Dire";
                        break;
                      default:
                        heroes[index].team = "Unknown";
                        break;
                    }
                  }
                  if (data.DOTAHeroes[hero.name].Legs)
                    heroes[index].legs = Number(data.DOTAHeroes[hero.name].Legs);

                  // Find key in format "Ability[1-9]"
                  for (var key in data.DOTAHeroes[hero.name]) {
                    if (data.DOTAHeroes[hero.name].hasOwnProperty(key)) {
                      if (/Ability[1-9]/.test(key)) {
                        if (abilities[data.DOTAHeroes[hero.name][key]] && abilities[data.DOTAHeroes[hero.name][key]].dname) {
                          var ability = new Ability();
                          ability.name = data.DOTAHeroes[hero.name][key];
                          ability.id = abilities[ability.name].id;
                          ability.key = key;
                          ability.full_name = abilities[ability.name].dname;
                          ability.affects = abilities[ability.name].affects;
                          ability.description = abilities[ability.name].desc;
                          ability.notes = abilities[ability.name].notes;
                          ability.lore = abilities[ability.name].lore;
                          heroes[index].abilities.push(ability);
                        }
                      }
                    }
                  }
                }
              });
              counter--;
              if (counter == 0) {
                returnJSON(res, heroes);
              }
            });
          });
        });
      }
    }
  });

  // var url = 'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json';

  // request(url, function(error, response, data) {
  //   if (error) {
  //     return console.log(error);
  //   }

  //   if (response.statusCode !== 200) {
  //     return console.log(response.statusCode)
  //   }

  //   // console.log(body);
  //   // res.setHeader('Content-Type', 'application/json');
  //   // res.send(JSON.stringify(data));
  //   // res.send(JSON.stringify(data, null, 2));
  //   // res.json(data);
  // })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// var express = require('express');
// var app = express();

// app.set('port', (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/public'));

// // views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

// app.get('/', function(request, response) {
//   response.render('pages/index');
// });

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });
