const Discord = require("discord.js");
const client = new Discord.Client();

module.exports = async (client, message, args, command) => {
let prefix = false;
const prefixes = ['kyouka ', '+'];
for(const thisPrefix of prefixes) {
  if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;

}
if(!prefix) return;
if(command === 'info') {
var characters = args.join(" ");
//makes the characters or the argument case insensitive when triggering the case
var characters = characters.toLowerCase()
switch (characters) {
  case 'misogi' : 
  const embed1 = new Discord.RichEmbed()
  .setThumbnail('https://redive.estertion.win/icon/unit/100411.webp')
  .setColor('RANDOM')
  .setTitle('Misogi')
  .addField('Name:', 'Misogi', true)
  .addField('Real Name:', '|| Hotaka Misogi ||', true)
  .addField('Height:', '128 cm (50.4 in)', true)
  .addField('Weight:','27kg (59.5lb)', true)
  .addField('Birthday:','August 10', true)
  .addField('Blood Type', 'O', true)
  .addField('Age:', '9', true)
  .addField('Species:', 'Human', true)
  .addField('Guild:', 'Little Lyrical', true)
  .addField('Likes:', 'Pranks, exploring', true)
  .setFooter('Voice actress: Morohoshi Sumire')
  .setImage('https://priconne.arcticpasserine.com/characters/misogi/character.png')
  // ------------------------------------------------------------------------------------------------------
  message.channel.send(embed1).then(async message => {message.react('⏪').then(r => {message.react('⏩')})});
const backwardsFilter = (reaction, user) => {
return reaction.emoji.name === '⏪' && user.id === message.author.id;
};
const forwardsFilter = (reaction, user) => {
return reaction.emoji.name === '⏩' && user.id === message.author.id;
};
console.log('wa')

message.awaitReactions(backwardsFilter, {max: 1, time: 60000, errors: ['time']})
.then(collected => {
  console.log('works')
  const embed2 = new Discord.RichEmbed()
  .setThumbnail('https://redive.estertion.win/icon/unit/100411.webp')
  .setColor('RANDOM')
  .setTitle('Misogi')
  .addField('Name:', 'Misogi', true)
  .addField('Real Name:', '|| Hotaka Misogi ||', true)
  .addField('Height:', '128 cm (50.4 in)', true)
  .addField('Weight:','27kg (59.5lb)', true)
  .addField('Birthday:','August 10', true)
  .addField('Blood Type', 'O', true)
  .addField('Age:', '9', true)
  .addField('Species:', 'Human', true)
  .addField('Guild:', 'Little Lyrical', true)
  .addField('Likes:', 'Pranks, exploring', true)
  .setFooter('Voice actress: Morohoshi Sumire')
  .setImage('https://priconne.arcticpasserine.com/characters/misogi/character.png')
  console.log('works')
  message.edit(embed2)})
  .catch(collected => {
    console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
    message.reply('you didn\'t react with neither a thumbs up, nor a thumbs down.');
});
  
message.awaitReactions(forwardsFilter, {max: 1, time: 60000, errors: ['time']})
.then(collected => {
  const reaction = collected.first();
  if (reaction.emoji.name === '⏩') {
const embed2 = new Discord.RichEmbed()
  .setThumbnail('https://redive.estertion.win/icon/unit/100411.webp')
  .setColor('RANDOM')
  .setTitle('Misaogi')
  .addField('Name:', 'Misogi', true)
  .addField('Blood Type', 'O', true)
  .addField('Age:', '9', true)
  .addField('Species:', 'Human', true)
  .addField('Guild:', 'Little Lyrical', true)
  .addField('Likes:', 'Pranks, exploring', true)
  .setFooter('Voice actress: Morohoshi Sumire')
  .setImage('https://priconne.arcticpasserine.com/characters/misogi/character.png')

  console.log('works')
  message.channel.send(embed2)
}});

break;
  
  }

}
};