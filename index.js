// Load up the discord.js library
const Discord = require("discord.js");
const Sequelize = require('sequelize');
// My client.
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
const bot = client
const { Client, RichEmbed } = require('discord.js');
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
  storage: 'database.sqlite',
  
});
/*
 * equivalent to: CREATE TABLE tags(
 * name VARCHAR(255),
 * description TEXT,
 * username VARCHAR(255),
 * usage INT
 * );
 */
const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

client.once ('ready', ()=> {
  Tags.sync();

});
client.on("ready", () => {
 
// This event will run if the bot starts, and logs in, successfully.
console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
// Example of changing the bot's playing game to something useful. `client.user` is what the
// docs refer to as the "ClientUser".
client.user.setActivity("with Mimi-chan");
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

bot.on('guildMemberAdd', member => {
  console.log('User' + member.user.tag + 'has joined the server!');

  var role = member.guild.roles.find(role => role.name === "Peco");
  member.addRole(role);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

// https://discordjs.guide/sequelize/#delta-adding-a-tag
client.on("message", async message => {
  let prefix = false;
  const prefixes = ['kyouka ', 'Kyouka', '+'];
  for(const thisPrefix of prefixes) {
    if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
 
  }
  if(!prefix) return;

  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
		const input = message.content.slice(prefix.length).split(' ');
		const command = input.shift();
		const commandArgs = input.join(' ');

		if (command === 'addtag') {
      const splitArgs = commandArgs.split(' ');
      const tagName = splitArgs.shift();
      const tagDescription = splitArgs.join(' ');
      
      try {
        // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
        const tag = await Tags.create({
          name: tagName,
          description: tagDescription,
          username: message.author.username,
        });
        return message.reply(`Tag ${tag.name} added.`);
      }
      catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          return message.reply('That tag already exists.');
        }
        return message.reply('Something went wrong with adding a tag.');
      }
      
		} else if (command === "tag") {
			const tagName = commandArgs;

// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
const tag = await Tags.findOne({ where: { name: tagName } });
if (tag) {
	// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
  tag.increment('usage_count');
  const description = tag.get('description')
  if (description.startsWith('https')) {
  return message.channel.send({files: [tag.get('description')]});
  }
  else {
  return message.channel.send(tag.get('description'))
  }}
else return message.channel.send(tag.get('description'));

		} else if (command === 'edittag') {
      const splitArgs = commandArgs.split(' ');
      const tagName = splitArgs.shift();
      const tagDescription = splitArgs.join(' ');
      
      // equivalent to: UPDATE tags (descrption) values (?) WHERE name='?';
      const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });
      if (affectedRows > 0) {
        return message.reply(`Tag ${tagName} was edited.`);
      }
      return message.reply(`Could not find a tag with name ${tagName}.`);
		} else if (command === 'taginfo') {
      const tagName = commandArgs;

      // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
      const tag = await Tags.findOne({ where: { name: tagName } });
      if (tag) {
        return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
      }
      return message.reply(`Could not find tag: ${tagName}`);
		} else if (command === 'showtags') {
		// equivalent to: SELECT name FROM tags;
const tagList = await Tags.findAll({ attributes: ['name'] });
const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';
return message.channel.send(`List of tags: ${tagString}`);
		} else if (command === 'removetag') {
      const tagName = commandArgs;
      // equivalent to: DELETE from tags WHERE name = ?;
      const rowCount = await Tags.destroy({ where: { name: tagName } });
      if (!rowCount) return message.reply('That tag did not exist.');
      
      return message.reply('Tag deleted.');
		}
	}
  // Ignore other bots. This also makes your bot ignore itself.

  
  // Ignore any message that does not start with our prefix, 
  // Which is set in the configuration file.
  // *if(message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  } 
  if(command === "PLACEHOLDER FOR NEW COMMANDS") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = "<:KyoukaPout:634276917939273768>";
    // And we get the bot to say the thing: https://git.heroku.com/kyoukachan.git
    message.channel.send(sayMessage);
  }
  if(command === "leave") {
   await message.channel.send("Leaving...");
var guildID = bot.guilds.find("id", '632280043044995092')
guildID.leave();
  }
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message. The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }  
  if(command === "clanbattleinfo") {

    message.channel.send("https://drive.google.com/drive/folders/1Lufya5iJKhAFZYXOmpLlwb_0HOU6iMDt?usp=sharing");
  }
  if(command === "f") {
    const user = message.author;

    return message.channel.send(`${user.username} has paid their respects. <:MahoHeart:634280442446479370>`);
  }
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example I just hardcode the role names.
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!")
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided"
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    if(!message.member.roles.some(r=>["Danchou", "Sub leader Fuckers"].includes(r.name)) )
    return message.reply("Sorry, you don't have permissions to use this!");
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    // So we get our messages, and delete them.
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

// THIS BLOCK OF CODE FOR THOSE WITHOUT PREFIX
client.on("message", async message => {

  if (message.author.bot) return;

  if (message.content.toLowerCase()=== "pout") {
    message.channel.send("<:KyoukaPout:634276917939273768>");
  } else
  if(message.content.toLowerCase()=== "reee") {
    message.channel.send("<:KyoukaREEE:634277119207407616>");
  } else
  if(message.content.toLowerCase()=== "ok") {
    message.channel.send("<:KyoukaIkimasu:634277561173803019>");
  } else
  if(message.content.toLowerCase()=== "worry") {
    message.channel.send("<:KyoukaWorry:634277390415167498>")
  } else 
  if(message.content.toLowerCase()=== "no lood") {
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/520242433049755662/642661656593170433/learn_self_control_image.png"]})
  } else 
  if(message.content.toLowerCase()=== "kyouka send nudes") {
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/452127517734862850/642668977390223401/Kyoukalood.gif"]})     
  } else
  if(message.content.toLowerCase()=== "kyouka step on me") {
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/640092288449642497/686695305034727432/EPvpufsVAAASm8d.png"]})
  } else
  if (message.content.toLowerCase()=== "add mystery fucker"){
    try {
      if (!message.guild) return await message.channel.send('You must be in a guild.');
      const role2 = message.guild.roles.find(role=>role.name === '10Q');
      if (role2) await message.member.addRole(role2);
      message.delete().catch(O_o=>{});
    } catch(err) {
      console.error(err);
    }
  } else
  //purge autistic fucker
    if(message.content.toLowerCase()=== "remove mystery fucker") {
        try {
          // message.member will be null for a DM, so check that the message is not a DM.
          if (!message.guild) return await message.channel.send('You must be in a guild.');
      
          // If the user has Role 1, remove it from them.
          const role1 = message.member.roles.find(role => role.name === '10Q');
          if (role1) await message.member.removeRole(role1);
          message.delete().catch(O_o=>{});
        } catch(err) {
          // Log any errors.
          console.error(err);
        }
    }
});

// THIS BLOCK OF CODE FOR THOSE WITH PREFIX BUT NOT COMMAND
client.on("message", (message) => {
  let prefix = false;
  const prefixes = ['kyouka ', '+'];
  for(const thisPrefix of prefixes) {
    if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;

  }
  if(!prefix) return;

  if (message.author.bot) return;

  if (message.content.toLowerCase()=== prefix + "pout") {
    message.channel.send("<:KyoukaPout:634276917939273768>");
  } else
  if(message.content.toLowerCase()=== prefix + "reee") {
    message.channel.send("<:KyoukaREEE:634277119207407616>");
  } else
  if(message.content.toLowerCase()=== prefix + "ok") {
    message.channel.send("<:KyoukaIkimasu:634277561173803019>");
  } else
  if(message.content.toLowerCase()=== prefix + "worry") {
    message.channel.send("<:KyoukaWorry:634277390415167498>")
  } else 
  if(message.content.toLowerCase()=== prefix + "no lood") {
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/520242433049755662/642661656593170433/learn_self_control_image.png"]} + "aaaaa")
  } else 
  if(message.content.toLowerCase()=== prefix + "send nudes") {
    message.channel.send({files: ["https://cdn.com/attachments/452127517734862850/642668977390223401/Kyoukalood.gif"]})
  } else
  if(message.content.startsWith(prefix + "cb-roles")) {
    const embed = new Discord.RichEmbed()
    .setColor(0xffffff)
    .setTitle("CB Boss Role(s)")
    .setDescription(`React to add role, Unreact to remove role \n\n1️⃣ Boss 1 \n\n2️⃣ Boss 2 \n\n3️⃣ Boss 3 \n\n4️⃣ Boss 4 \n\n5️⃣ Boss 5`)
    message.channel.send(embed).then(async msg => {
      await msg.react("1️⃣")
      await msg.react("2️⃣")
      await msg.react("3️⃣")
      await msg.react("4️⃣")
      await msg.react("5️⃣")
      // using an await to make reaction in order
    })
  }
});
    
    
    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch()
      if (user.bot) return;
      if (!reaction.message.guild) return;
      if (reaction.message.channel.id === "738910839620370542")
        if (reaction.emoji.name === "1️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.addRole("738880435420921927")});

        }
        if (reaction.emoji.name === "2️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.addRole("738880543453610174")});
      }     
        if (reaction.emoji.name === "3️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.addRole("738880611711844412")});
      }
        if (reaction.emoji.name === "4️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.addRole("738880657358454804")});
      }
        if (reaction.emoji.name === "5️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.addRole("738880704779386931")});
        return; //if channel isnt self role
      }
    })
    client.on("messageReactionRemove", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch()
      if (user.bot) return;
      if (!reaction.message.guild) return;
      //if (reaction.message.channel.id === "639729715955105792")
        if (reaction.emoji.name === "1️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.removeRole("738880435420921927")});
    
        }
        if (reaction.emoji.name === "2️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.removeRole("738880543453610174")});
       
      }     
        if (reaction.emoji.name === "3️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.removeRole("738880611711844412")});
        
      }
        if (reaction.emoji.name === "4️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.removeRole("738880657358454804")});
  
      }
        if (reaction.emoji.name === "5️⃣") {
          await reaction.message.guild.fetchMember(user.id).then(member =>{ member.removeRole("738880704779386931")});
      } else {
        return; //if channel isnt self role
      }
    })

// THIS BLOCK OF CODE IS FOR HEADPATS
client.on("message", (message) => {
  let prefix = false;
  const prefixes = ['kyouka ', '+'];
  for(const thisPrefix of prefixes) {
    if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;

  }
  if(!prefix) return;

  if (message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  
pat1 = "https://media1.tenor.com/images/005e8df693c0f59e442b0bf95c22d0f5/tenor.gif?itemid=10947495";
pat2 = "https://media1.tenor.com/images/f5176d4c5cbb776e85af5dcc5eea59be/tenor.gif?itemid=5081286"; 
pat3 = "hhttps://media1.tenor.com/images/f330c520a8dfa461130a799faca13c7e/tenor.gif?itemid=13911345";
pat4 = "https://media1.tenor.com/images/143a887b46092bd880997119ecf09681/tenor.gif?itemid=15177421";
pat5 = "https://media1.tenor.com/images/6bf8121f22560443e71de4340bdb36bb/tenor.gif?itemid=15151785";
pat6 = "https://media1.tenor.com/images/f41b3974036070fd1c498acf17a3a42e/tenor.gif?itemid=14751753";
pat7 = "https://media1.tenor.com/images/282cc80907f0fe82d9ae1f55f1a87c03/tenor.gif?itemid=12018857";
pat8 = "https://media1.tenor.com/images/9fa1e50a657ea2ece043de6e0e93ac8e/tenor.gif?itemid=10361558";
pat9 = "https://media1.tenor.com/images/2e62cd7491be4ec9f0ec210d648b80fd/tenor.gif?itemid=10947505";
pat10 = "https://media1.tenor.com/images/daa885ec8a9cfa4107eb966df05ba260/tenor.gif?itemid=13792462";

if(command === 'pat') {
  const mentionUser = args.join(" ");
  const mentionAuthor = message.author
  number = 9;
  var random = Math.floor (Math.random() * (number - 1 + 1)) +1;
  switch (random) {
  case 1 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat1)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 2 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat2)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 3 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat3)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 5 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat4)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 4 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat5)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 6 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat6)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 7 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat7)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 8 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat8)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 9 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat9)); message.channel.send (`${mentionUser}, you got a pat from ${mentionAuthor}`); break;
  case 10 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat10)
  .addField(`${mentionUser}, you got a pat from ${mentionAuthor}`)); break;
  }
}
});

// THIS BLOCK IS FOR PRICONNE STUFF

client.on("message", (message) => {
// prefix
  let prefix = false;
  const prefixes = ['kyouka ', 'Kyouka', '+'];
  for(const thisPrefix of prefixes) {
    if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
 
  }
  if(!prefix) return;
if (message.author.bot) return;
const args = message.content.slice(prefix.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();
// info
if(command === 'info') {
  var characters = args.join("");
  var characters = characters.toLowerCase()
  switch (characters) {
    case 'akari' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100631.webp')
    .setColor('RANDOM')
    .addField('Akari | アカリ')
    .addField('Name:', 'Akari', true)
    .addField('Real Name:', 'Kazemiya Akari', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'November 22', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Saxophone', true)
    .addField('Voice actress:', 'Asakura Azumi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Akari ')
    ); break;
    case 'akino' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103231.webp')
    .setColor('RANDOM')
    .addField('Akino | アキノ')
    .addField('Name:', 'Akino', true)
    .addField('Real Name:', 'Toudou Akino', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'March 12', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Charity work', true)
    .addField('Voice actress:', 'Matsuzaki Rei', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Akino ')
    ); break;
    case 'anne' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109231.webp')
    .setColor('RANDOM')
    .addField('Anne | アン')
    .addField('Name:', 'Anne', true)
    .addField('Real Name:', 'Anne', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '55 kg', true)
    .addField('Birthday:', 'December 1', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Otherworld visitors', true)
    .addField('Likes', 'Reading', true)
    .addField('Voice actress:', 'Hikasa Youko', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/ann/character.png`)
    .setFooter('Other Versions of this character: Anne')
    ); break;
    case 'anna' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100931.webp')
    .setColor('RANDOM')
    .addField('Anna | アンア')
    .addField('Name:', 'Anna', true)
    .addField('Real Name:', 'Hiiragi Anna', true)
    .addField('Height:', '160 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'July 5', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', 'Novel Writing', true)
    .addField('Voice actress:', 'Takano Asami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Anna ')
    ); break;
    case 'aoi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104031.webp')
    .setColor('RANDOM')
    .addField('Aoi | アオイ')
    .addField('Name:', 'Aoi', true)
    .addField('Real Name:', 'Futaba Aoi', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '44 kg', true)
    .addField('Birthday:', 'June 6', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Forestier', true)
    .addField('Likes', 'Making friends', true)
    .addField('Voice actress:', 'Hanazawa Kana', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Aoi, Student Aoi')
    ); break;
    case 'arisa' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106331.webp')
    .setColor('RANDOM')
    .addField('Arisa | アリサ')
    .addField('Name:', 'Arisa', true)
    .addField('Real Name:', 'Arisa', true)
    .addField('Height:', '155 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'June 17', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Protecting the forest', true)
    .addField('Voice actress:', 'Yuuki Kana', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Arisa ')
    ); break;
    case 'ayane' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102331.webp')
    .setColor('RANDOM')
    .addField('Ayane | アヤネ')
    .addField('Name:', 'Ayane', true)
    .addField('Real Name:', 'Houjou Ayane', true)
    .addField('Height:', '148 cm', true)
    .addField('Weight:', '38 kg', true)
    .addField('Birthday:', 'May 10', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Sarendia', true)
    .addField('Likes', 'Playing indoors', true)
    .addField('Voice actress:', 'Serizawa Yuu', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Ayane, Christmas Ayane ')
    ); break;
    case 'ayumi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105531.webp')
    .setColor('RANDOM')
    .addField('Ayumi | アユミ')
    .addField('Name:', 'Ayumi', true)
    .addField('Real Name:', 'Ayumi', true)
    .addField('Height:', '155 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'April 7', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Observing', true)
    .addField('Voice actress:', 'Ohzeki Eri', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Ayumi ')
    ); break;
    case 'chika' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104231.webp')
    .setColor('RANDOM')
    .addField('Chika | チカ')
    .addField('Name:', 'Chika', true)
    .addField('Real Name:', 'Misumi Chika', true)
    .addField('Height:', '163 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'June 3', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Carmina', true)
    .addField('Likes', 'Musical Intruments', true)
    .addField('Voice actress:', 'Ayaka Fukuhara', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Chika, Christmas Chika ')
    ); break;
    case 'chloe' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/110831.webp')
    .setColor('RANDOM')
    .addField('Chloe |　クロエ')
    .addField('Name:', 'Chloe', true)
    .addField('Real Name:', 'Chloe', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'August 7', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'St. Teresa', true)
    .addField('Likes', 'Darts', true)
    .addField('Voice actress:', 'Tanezaki Atsumi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Chloe')
    ); break;
    case 'christina' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/107131.webp')
    .setColor('RANDOM')
    .addField('Christina | クリスティーナ')
    .addField('Name:', 'Christina', true)
    .addField('Real Name:', 'Christina Morgan', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'February 7', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '27', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Battling strong opponents', true)
    .addField('Voice actress:', 'Takahashi Chiaki', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Christina, Christmas Christina')
    ); break;
    case 'djeeta' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105731.webp')
    .setColor('RANDOM')
    .addField('Djeeta | ジータ')
    .addField('Name:', 'Djeeta', true)
    .addField('Real Name:', 'Djeeta', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'March 10', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Adventuring', true)
    .addField('Voice actress:', 'Kanemoto Hisaki', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Djeeta')
    ); break;
    case 'emilia' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109931.webp')
    .setColor('RANDOM')
    .addField('Emilia | エミリア')
    .addField('Name:', 'Emilia', true)
    .addField('Real Name:', 'Emilia', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'September 23', true)
    .addField('Blood Type:', 'N/A', true)
    .addField('Age:', '107', true)
    .addField('Species:', 'Half-elf', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Studying', true)
    .addField('Voice actress:', 'Takahashi Rie', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Emilia')
    ); break;
    case 'eriko' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102731.webp')
    .setColor('RANDOM')
    .addField('Eriko | エリコ')
    .addField('Name:', 'Eriko', true)
    .addField('Real Name:', 'Kuraishi Eriko', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'July 30', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', '~~Kishi-kun~~ Cooking', true)
    .addField('Voice actress:', 'Hashimoto Chinami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Eriko, Valentines Eriko')
    ); break;
    case 'grea' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109431.webp')
    .setColor('RANDOM')
    .addField('Grea | グレア')
    .addField('Name:', 'Grea', true)
    .addField('Real Name:', 'Grea', true)
    .addField('Height:', '167 cm', true)
    .addField('Weight:', '67 kg', true)
    .addField('Birthday:', 'November 3', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Half-human', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Piano', true)
    .addField('Voice actress:', 'Fukuhara Ayaka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Grea ')
    ); break;
    case 'hatsune' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101231.webp')
    .setColor('RANDOM')
    .addField('Hatsune | ハツネ')
    .addField('Name:', 'Hatsune', true)
    .addField('Real Name:', 'Kashiwazaki Hatsune', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'December 24', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Forestier', true)
    .addField('Likes', 'Sleeping ~~during the day~~', true)
    .addField('Voice actress:', 'Oohashi Ayaka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Hatsune ')
    ); break;
    case 'hiyori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100131.webp')
    .setColor('RANDOM')
    .addField('Hiyori | ヒヨリ')
    .addField('Name:', 'Hiyori', true)
    .addField('Real Name:', 'Harusaki Hiyori', true)
    .addField('Height:', '155 cm', true)
    .addField('Weight:', '44 kg', true)
    .addField('Birthday:', 'August 27', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Twinkle Wish', true)
    .addField('Likes', 'Helping people', true)
    .addField('Voice actress:', 'Touyama Nao', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Hiyori, New Year Hiyori')
    ); break;
    case 'illya' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104431.webp')
    .setColor('RANDOM')
    .addField('Illya | イィヤ')
    .addField('Name:', 'Illya', true)
    .addField('Real Name:', 'Illya Ornstein', true)
    .addField('Height:', '172 cm', true)
    .addField('Weight:', '50 kg', true)
    .addField('Birthday:', 'May 5', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', 'N/A', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'World Domination', true)
    .addField('Voice actress:', 'Tange Sakura', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Illya, Christmas Illya')
    ); break;
    case 'io' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101831.webp')
    .setColor('RANDOM')
    .addField('Io | イオ')
    .addField('Name:', 'Io', true)
    .addField('Real Name:', 'Hasekura Io', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'August 14', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '23', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Lucent Academy', true)
    .addField('Likes', 'Romance', true)
    .addField('Voice actress:', 'Itou Shizuka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Io, Summer Io')
    ); break;
    case 'jun' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104731.webp')
    .setColor('RANDOM')
    .addField('Jun | ジュン')
    .addField('Name:', 'Jun', true)
    .addField('Real Name:', 'Shirogane Jun', true)
    .addField('Height:', '171 cm', true)
    .addField('Weight:', '50 kg', true)
    .addField('Birthday:', 'October 25', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '25', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Martial Arts', true)
    .addField('Voice actress:', 'Kawasumi Aako', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Jun')
    ); break;
    case 'kaori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101731.webp')
    .setColor('RANDOM')
    .addField('Kaori | カオリ')
    .addField('Name:', 'Kaori', true)
    .addField('Real Name:', 'Kyan Kaori', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '53 kg', true)
    .addField('Birthday:', 'July 7', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Dancing', true)
    .addField('Voice actress:', 'Takamori Natsumi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kaori, Summer Kaori')
    ); break;
    case 'kasumi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101431.webp')
    .setColor('RANDOM')
    .addField('Kasumi |　カスミ')
    .addField('Name:', 'Kasumi', true)
    .addField('Real Name:', 'Kirihara Kasumi', true)
    .addField('Height:', '152 cm', true)
    .addField('Weight:', '41 kg', true)
    .addField('Birthday:', 'November 3', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Solving Mysteries', true)
    .addField('Voice actress:', 'Minase Inori', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kasumi')
    ); break;
    case 'kokkoro' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105931.webp')
    .setColor('RANDOM')
    .addField('Kokkoro | コッコロ')
    .addField('Name:', 'Kokkoro', true)
    .addField('Real Name:', 'Natsume Kokkoro', true)
    .addField('Height:', '140 cm', true)
    .addField('Weight:', '35 kg', true)
    .addField('Birthday:', 'May 11', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '11', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Plants and animals', true)
    .addField('Voice actress:', 'Itou Miku', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kokkoro, Summer Kokkoro')
    ); break;
    case 'kuuka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104531.webp')
    .setColor('RANDOM')
    .addField('Kuuka | クウカ')
    .addField('Name:', 'Kuuka', true)
    .addField('Real Name:', 'Tohmi Kuuka', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'November 19', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Reading Novels', true)
    .addField('Voice actress:', 'Nagatsuma Juri', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kuuka, Oedo Kuuka')
    ); break;
    case 'kyaru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106031.webp')
    .setColor('RANDOM')
    .addField('Kyaru | キャル')
    .addField('Name:', 'Kyaru', true)
    .addField('Real Name:', 'Momochi Kiruya', true)
    .addField('Height:', '152 cm', true)
    .addField('Weight:', '39 kg', true)
    .addField('Birthday:', 'September 2', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Neko', true)
    .addField('Voice actress:', 'Tachibana Rika', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kyaru, Summer Kyaru')
    ); break;
    case 'kyouka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103631.webp')
    .setColor('RANDOM')
    .addField('Kyouka | キョウカ')
    .addField('Name:', 'Kyouka', true)
    .addField('Real Name:', 'Hikawa Kyouka', true)
    .addField('Height:', '118 cm', true)
    .addField('Weight:', '21 kg', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '8', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Studying', true)
    .addField('Voice actress:', 'Ogura Yui', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Kyouka, Halloween Kyouka')
    ); break;
    case 'rima' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105231.webp')
    .setColor('RANDOM')
    .addField('Rima | リマ')
    .addField('Name:', 'Rima', true)
    .addField('Real Name:', 'Rima', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '100 kg', true)
    .addField('Birthday:', 'March 14', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Grooming', true)
    .addField('Voice actress:', 'Tokui Sora', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Rima')
    ); break;
    case 'ruka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105631.webp')
    .setColor('RANDOM')
    .addField('Ruka |　ルカ')
    .addField('Name:', 'Ruka', true)
    .addField('Real Name:', 'Tachiarai Ruka', true)
    .addField('Height:', '167 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'July 1', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '25', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', 'Fishing', true)
    .addField('Voice actress:', 'Satou Rina', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Ruka')
    ); break;
    case 'mahiru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103331.webp')
    .setColor('RANDOM')
    .addField('Mahiru |　マヒル')
    .addField('Name:', 'Mahiru', true)
    .addField('Real Name:', 'Noto Mahiru', true)
    .addField('Height:', '142 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'March 3', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '20', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Manzai', true)
    .addField('Voice actress:', 'Nitta emi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Mahiru')
    ); break;
    case 'maho' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101031.webp')
    .setColor('RANDOM')
    .addField('Maho | マホ')
    .addField('Name:', 'Maho', true)
    .addField('Real Name:', 'Mimemiya Maho', true)
    .addField('Height:', '155 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'September 22', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Plushies', true)
    .addField('Voice actress:', 'Uchida Maaya', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Maho, Summer Maho')
    ); break;
    case 'makoto' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104331.webp')
    .setColor('RANDOM')
    .addField('Makoto | マコト')
    .addField('Name:', 'Makoto', true)
    .addField('Real Name:', 'Aki Makoto', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'August 9', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Making Pastries', true)
    .addField('Voice actress:', 'Komatsu Mikako', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Makoto, Summer Makoto')
    ); break;
    case 'matsuri' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100531.webp')
    .setColor('RANDOM')
    .addField('Matsuri | マツリ')
    .addField('Name:', 'Matsuri', true)
    .addField('Real Name:', 'Orihara Matsuri', true)
    .addField('Height:', '146 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 25', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '12', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Heroes', true)
    .addField('Voice actress:', 'Shimoda Asami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Matsuri')
    ); break;
    case 'mifuyu' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104831.webp')
    .setColor('RANDOM')
    .addField('Mifuyu | ミフユ')
    .addField('Name:', 'Mifuyu', true)
    .addField('Real Name:', 'Ohgami Mifuyu', true)
    .addField('Height:', '163 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'November 11', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '20', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Mercenary Works', true)
    .addField('Voice actress:', 'Tadokoro Azusa', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Mifuyu, Summer Mifuyu')
    ); break;
    case 'mimi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102031.webp')
    .setColor('RANDOM')
    .addField('Mimi | ミミ')
    .addField('Name:', 'Mimi', true)
    .addField('Real Name:', 'Akane Mimi', true)
    .addField('Height:', '117 cm', true)
    .addField('Weight:', '21 kg', true)
    .addField('Birthday:', 'April 3', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '10', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Cute things', true)
    .addField('Voice actress:', 'Hidaka Rina', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Mimi, Summer Mimi')
    ); break;
    case 'misaki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105031.webp')
    .setColor('RANDOM')
    .addField('Misaki | ミサキ')
    .addField('Name:', 'Misaki', true)
    .addField('Real Name:', 'Tamaizumi Misaki', true)
    .addField('Height:', '120 cm', true)
    .addField('Weight:', '22 kg', true)
    .addField('Birthday:', 'January 3', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '11', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Lucent Academy', true)
    .addField('Likes', 'Cosmetics', true)
    .addField('Voice actress:', 'Kuno Misaki', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Misaki, Halloween Misaki')
    ); break;
    case 'misato' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101531.webp')
    .setColor('RANDOM')
    .addField('Misato | ミサト')
    .addField('Name:', 'Misato', true)
    .addField('Real Name:', 'Aikawa Misato', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'September 5', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '21', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Forestier', true)
    .addField('Likes', 'Making Picture Books', true)
    .addField('Voice actress:', 'Kouda Mariko', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Misato')
    ); break;
    case 'misogi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100431.webp')
    .setColor('RANDOM')
    .addField('Misogi | ミソギ')
    .addField('Name:', 'Misogi', true)
    .addField('Real Name:', 'Hotaka Misogi', true)
    .addField('Height:', '128 cm', true)
    .addField('Weight:', '27 kg', true)
    .addField('Birthday:', 'August 10', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '9', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Making Pranks', true)
    .addField('Voice actress:', 'Morohoshi Sumire', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Misogi, Halloween Misogi')
    ); break;
    case 'mitsuki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105131.webp')
    .setColor('RANDOM')
    .addField('Mitsuki | ミツキ')
    .addField('Name:', 'Mitsuki', true)
    .addField('Real Name:', 'Yoigahama Mitsuki', true)
    .addField('Height:', '166 cm', true)
    .addField('Weight:', '53 kg', true)
    .addField('Birthday:', 'March 7', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '27', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twilight Caravanu', true)
    .addField('Likes', 'Experiments', true)
    .addField('Voice actress:', 'Mitsuishi Kotono', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Mitsuki')
    ); break;
    case 'miyako' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100731.webp')
    .setColor('RANDOM')
    .addField('Miyako | ミヤコ')
    .addField('Name:', 'Miyako', true)
    .addField('Real Name:', 'Izumo miyako', true)
    .addField('Height:', '130 cm', true)
    .addField('Weight:', '32 cm', true)
    .addField('Birthday:', 'January 23', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Pudding', true)
    .addField('Voice actress:', 'Amamiya Sora', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Miyako, Halloween Miyako')
    ); break;
    case 'monika' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105331.webp')
    .setColor('RANDOM')
    .addField('Monika | モニカ')
    .addField('Name:', 'Monika', true)
    .addField('Real Name:', 'Monika Weisswind', true)
    .addField('Height:', '140 cm', true)
    .addField('Weight:', '33 kg', true)
    .addField('Birthday:', 'July 28', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Candies', true)
    .addField('Voice actress:', 'Tsuji Ayumi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Monika')
    ); break;
    case 'muimi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106131.webp')
    .setColor('RANDOM')
    .addField('Muimi | ムイミ')
    .addField('Name:', 'Muimi', true)
    .addField('Real Name:', 'Novem', true)
    .addField('Height:', '148 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'August 11', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Unknown', true)
    .addField('Likes', 'Adventures', true)
    .addField('Voice actress:', 'Han Megumi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Muimi')
    ); break;
    case 'nanaka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101331.webp')
    .setColor('RANDOM')
    .addField('Nanaka | ナナカ')
    .addField('Name:', 'Nanaka', true)
    .addField('Real Name:', 'Tanno Nanaka', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', '55 kg', true)
    .addField('Birthday:', 'August 21', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', 'Reading and Magic', true)
    .addField('Voice actress:', 'Yoshimura Haruka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Nanaka')
    ); break;
    case 'neneka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/107031.webp')
    .setColor('RANDOM')
    .addField('Neneka | ネネカ')
    .addField('Name:', 'Neneka', true)
    .addField('Real Name:', 'Neneka', true)
    .addField('Height:', '149 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'March 24', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '24', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Unknown', true)
    .addField('Likes', 'Imitating', true)
    .addField('Voice actress:', 'Iguchi Yuka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Neneka')
    ); break;
    case 'ninon' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103031.webp')
    .setColor('RANDOM')
    .addField('Ninon | ニノン')
    .addField('Name:', 'Ninon', true)
    .addField('Real Name:', 'Ninon Joubert', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '51 kg', true)
    .addField('Birthday:', 'August 31', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Ninjas', true)
    .addField('Voice actress:', 'Satou Satomi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Ninon, Oedo Ninon')
    ); break;
    case 'nozomi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102931.webp')
    .setColor('RANDOM')
    .addField('Nozomi | ノゾミ')
    .addField('Name:', 'Nozomi', true)
    .addField('Real Name:', 'Sakurai Nozomi', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'January 24', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Carmina', true)
    .addField('Likes', 'Dancing', true)
    .addField('Voice actress:', 'Hikasa Youko', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Nozomi, Christmas Nozomi')
    ); break;
    case 'pecorine' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105831.webp')
    .setColor('RANDOM')
    .addField('Pecorine |　ペコリーヌ')
    .addField('Name:', 'Pecorine', true)
    .addField('Real Name:', '|| Eustiana von Astraea ||', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'March 31', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Eating, Cooking', true)
    .addField('Voice actress:', 'M・A・O', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Pecorine, Summer Peocorine')
    ); break;
    case 'ram' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109831.webp')
    .setColor('RANDOM')
    .addField('Ram | ラム')
    .addField('Name:', 'Ram', true)
    .addField('Real Name:', 'Ram', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'N/A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Oni', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Reading', true)
    .addField('Voice actress:', 'Murakawa Rie', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Ram')
    ); break;
    case 'rei' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100331.webp')
    .setColor('RANDOM')
    .addField('Rei | レイ')
    .addField('Name:', 'Rei', true)
    .addField('Real Name:', 'Shijou Rei', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'January 12', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twinkle Wish', true)
    .addField('Likes', 'Reading', true)
    .addField('Voice actress:', 'Hayami Saori', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Rei, New Year Rei')
    ); break;
    case 'rem' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109731.webp')
    .setColor('RANDOM')
    .addField('Rem | レム')
    .addField('Name:', 'Rem', true)
    .addField('Real Name:', 'Rem', true)
    .addField('Height:', '154cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'N/A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Oni', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Poetry', true)
    .addField('Voice actress:', 'Minase Inori', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Rem')
    ); break;
    case 'rin' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102631.webp')
    .setColor('RANDOM')
    .addField('Rin | リン')
    .addField('Name:', 'Rin', true)
    .addField('Real Name:', 'Morichika Rin', true)
    .addField('Height:', '144 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'January 1', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Red Bean Bread', true)
    .addField('Voice actress:', 'Koiwai Kotori', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Rin')
    ); break;
    case 'Rino' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101131.webp')
    .setColor('RANDOM')
    .addField('Rino | リノ')
    .addField('Name:', 'Rino', true)
    .addField('Real Name:', 'Inosaki Rino', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '44 kg', true)
    .addField('Birthday:', 'August 25', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Labyrinth', true)
    .addField('Likes', 'Sewing', true)
    .addField('Voice actress:', 'Asumi Kana', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Rino')
    ); break;
    case 'saren' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102831.webp')
    .setColor('RANDOM')
    .addField('Saren | サレン')
    .addField('Name:', 'Saren', true)
    .addField('Real Name:', 'Sasaki Saren', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'October 4', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Sarendia', true)
    .addField('Likes', 'Tea parties', true)
    .addField('Voice actress:', 'Horie Yui', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Saren, Summer Saren')
    ); break;
    case 'shinobu' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103131.webp')
    .setColor('RANDOM')
    .addField('Shinobu | シノブ')
    .addField('Name:', 'Shinobu', true)
    .addField('Real Name:', 'Kamiki Shinobu', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'December 22', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Fortune Telling', true)
    .addField('Voice actress:', 'Ootsubo Yuka', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Shinobu, Halloween Shinobu')
    ); break;
    case 'shiori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103831.webp')
    .setColor('RANDOM')
    .addField('Shiori | シオリ')
    .addField('Name:', 'Shiori', true)
    .addField('Real Name:', 'Kashiwazaki Shiori', true)
    .addField('Height:', '153 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 3', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Reading Books', true)
    .addField('Voice actress:', 'Koshimizu Ami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Shiori')
    ); break;
    case 'shizuru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104931.webp')
    .setColor('RANDOM')
    .addField('Shizuru | シズル')
    .addField('Name:', 'Shizuru', true)
    .addField('Real Name:', 'Hoshino Shizuru', true)
    .addField('Height:', '168 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'October 24', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Labyrinth', true)
    .addField('Likes', 'Houseworks', true)
    .addField('Voice actress:', 'Nabatame Hitomi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Shizuru, Valentine Shizuru')
    ); break;
    case 'suzume' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102531.webp')
    .setColor('RANDOM')
    .addField('Suzume | スズメ')
    .addField('Name:', 'Suzume', true)
    .addField('Real Name:', 'Amano Suzume', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'December 12', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Sarendia', true)
    .addField('Likes', 'Any kind of service', true)
    .addField('Voice actress:', 'Yuuki Aoi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Suzume, Summer Suzume')
    ); break;
    case 'suzuna' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101631.webp')
    .setColor('RANDOM')
    .addField('Suzuna | スズナ')
    .addField('Name:', 'Suzuna', true)
    .addField('Real Name:', 'Minami Suzuna', true)
    .addField('Height:', '167 cm', true)
    .addField('Weight:', '48 kg', true)
    .addField('Birthday:', 'April 10', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Lucent Academy', true)
    .addField('Likes', 'Fashion', true)
    .addField('Voice actress:', 'Uesaka Sumire', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Suzuna, Summer Suzuna')
    ); break;
    case 'tamaki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104631.webp')
    .setColor('RANDOM')
    .addField('Tamaki | タマキ')
    .addField('Name:', 'tamaki', true)
    .addField('Real Name:', 'Miyasaka Tamaki', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '48 kg', true)
    .addField('Birthday:', 'March 1', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '19', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Nekos', true)
    .addField('Voice actress:', 'Numakura Manami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Tamaki, Summer Tamaki')
    ); break;
    case 'tomo' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103731.webp')
    .setColor('RANDOM')
    .addField('Tomo | トモ')
    .addField('Name:', 'Tomo', true)
    .addField('Real Name:', 'Mikuma Tomo', true)
    .addField('Height:', '149 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'August 11', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Fencing', true)
    .addField('Voice actress:', 'Chihara Minori', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Tomo')
    ); break;
    case 'tsumugi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105431.webp')
    .setColor('RANDOM')
    .addField('Tsumugi | ツムギ')
    .addField('Name:', 'Tsumugi', true)
    .addField('Real Name:', 'Mayumiya Tsumugi', true)
    .addField('Height:', '153 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'September 7', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Carmina', true)
    .addField('Likes', 'Tailoring', true)
    .addField('Voice actress:', 'Kido Ibuki', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Tsumugi')
    ); break;
    case 'yori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100131.webp')
    .setColor('RANDOM')
    .addField('Yori | ヨリ')
    .addField('Name:', 'Yori', true)
    .addField('Real Name:', 'Kazemiya Yori', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 22', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Games', true)
    .addField('Voice actress:', 'Hara Sayuri', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Yori')
    ); break;
    case 'yui' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100231.webp')
    .setColor('RANDOM')
    .addField('Yui | ユイ')
    .addField('Name:', 'Yui', true)
    .addField('Real Name:', 'Kusano Yui', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '47 kg', true)
    .addField('Birthday:', 'April 5', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twinkle Wish', true)
    .addField('Likes', 'Being a Housewife', true)
    .addField('Voice actress:', 'Taneda Risa', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Yui, New Year Yui')
    ); break;
    case 'yukari' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103431.webp')
    .setColor('RANDOM')
    .addField('Yukari | ユカリ')
    .addField('Name:', 'Yukari', true)
    .addField('Real Name:', 'Ayase Yukari', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '55 kg', true)
    .addField('Birthday:', 'March 16', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '22', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Shopping', true)
    .addField('Voice actress:', 'Imai Asami', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Yukari')
    ); break;
    case 'yuki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100831.webp')
    .setColor('RANDOM')
    .addField('Yuki | ユキ')
    .addField('Name:', 'Yuki', true)
    .addField('Real Name:', 'Nijimura Yuki', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'October 10', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Mirrors', true)
    .addField('Voice actress:', 'Ohzora Naomi', true)
    .setImage(`https://priconne.arcticpasserine.com/characters/${characters}/character.png`)
    .setFooter('Other Versions of this character: Yuki')
    ); break;
  }







}
if(command =='skillinfo') {
  var characters = args.join("");
  var characters = characters.toLowerCase()
  switch (characters) {
    case 'akari' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100631.webp')
    .setColor('RANDOM')
    .addField('Akari | アカリ')
    .addField('Position:', 'Middle')
    .addField('UB:', 'Increases the magical attack of all allies by 455, and additionally causes their next attack to restore their own HP.')
    .addField('Skill 1: ', 'Deals 6132[12375] magical damage to the first enemy in front.')
    .addField('Skill 2: ', 'Decreases the magic defense of the first enemy in front by 101')
    .addField('EX skill:', 'Increases own magic attack at the beginning of the battle')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> A -> 1 -> A -> 1]')
    .setFooter('Other Versions of this character: Akari ')
    ); break;
    case 'akino' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103231.webp')
    .setColor('RANDOM')
    .addField('Akino | アキノ')
    .addField('Position:', 'Front')
    .addField('UB:', '27458 physical damage to a single enemy in front')
    .addField('Skill 1: ', '6684[7111] physical damage to a single enemy in front and increases own physical power by 611, if attacked while laughing, counterattacks by 4576[14222] physical damage within her range [and Increase own TP by 15].')
    .addField('Skill 2: ', 'All allies within a certain radius are given a 272 HP per second healing effect.')
    .addField('EX skill:', 'Increases own physical attack at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Akino ')
    ); break;
    case 'anne' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109231.webp')
    .setColor('RANDOM')
    .addField('Anne | アン')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deals magic damage to a single enemy in front by 36469. Increase magic attack of all affected allies by 2466')
    .addField('Skill 1: ', 'Deals 14861 magic damage to a single enemy in front')
    .addField('Skill 2: ', 'Increase magic attack of all allies within a certain radius from the caster by 1713. Further increase action speed of those affected.')
    .addField('EX skill:', 'Increase own magic attack at the beginning of the battle')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> A -> 1')
    .setFooter('Other Versions of this character: Anne')
    ); break;
    case 'anna' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100931.webp')
    .setColor('RANDOM')
    .addField('Anna | アンア')
    .addField('Position:', 'Middle')
    .addField('UB:', 'Deal 7994 magic damage to all enemies. Decreases own physical and magical defence to 0.')
    .addField('Skill 1: ', 'Deal 9569[12109 and decrease magic defence by 72] magic damage to a single enemy in front')
    .addField('Skill 2: ', 'Activates when own HP is 10% or less of the maximum HP, causes magical damage to all nearby enemies but become incapable of combat')
    .addField('EX skill:', 'Increase own magic attack at the beginning of the battle.')
    .addField('Attack Pattern:', '[LOOP 1 -> A]')
    .setFooter('Other Versions of this character: Anna ')
    ); break;
    case 'aoi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104031.webp')
    .setColor('RANDOM')
    .addField('Aoi | アオイ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deal 7670 physical damage to enemies within the range of closest enemy character.')
    .addField('Skill 1: ', 'Deal 274 physical damage and inflict poison that deals 274 physical damage to a single enemy. [When the enemy is poisoned, deal 29166 physical damage, else, deal 8749 instead. Inflict poison that deals 3500 damage if poisoned, else, inflict 468 damage instead.')
    .addField('Skill 2: ', 'Deal 3257 physical damage to a single enemy and makes them paralized.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> 2]')
    
    .setFooter('Other Versions of this character: Aoi, Student Aoi')
    ); break;
    case 's.aoi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/110731.webp')
    .setColor('RANDOM')
    .addField('Student Aoi | アオイ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deal 19488 physical damage to a single enemy in front, decrease its physical defence by 140, and Inflict poison that deals 840 damage.')
    .addField('Skill 1: ', 'Creates a physical damage field in front that deals 4095 physical damage per second to enemies who is in poisoned state. Deal 819 physical damage per second if the target(s) are not poisoned.')
    .addField('Skill 2: ', 'Reduces physical defence of a single enemy in front by 98, when the enemy is in poisoned state, additionally deal 12992 physical damage to that enemy.')
    .addField('EX skill:', 'Increase physical attack at the beginning of the battle.')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> A -> 1]')
    .setFooter('Other Versions of this character: Aoi, Student Aoi')
    ); break;
    case 'arisa' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106331.webp')
    .setColor('RANDOM')
    .addField('Arisa | アリサ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deal 27045 physical damage to a single enemy in front. If Union Burst has been used once in the battle, deal 41635 physical damage instead.')
    .addField('Skill 1: ', 'Deal 5204[11100] physical damage to a single enemy with highest magic attack power. Further decrease the action speed of that target. [Aditionally Reduces the magic attack power of that target.')
    .addField('Skill 2: ', 'Recovers own TP by 263. Recovers 420 TP instead if Union burst has been used once in the battle.')
    .addField('EX skill:', 'Increase own physical attack at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> A -> [LOOP -> 2 -> A -> 2 -> 1 -> A -> 2 -> A -> 2]')
    .setFooter('Other Versions of this character: Arisa ')
    ); break;
    case 'ayane' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102331.webp')
    .setColor('RANDOM')
    .addField('Ayane | アヤネ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 23805 physical damage to a single enemy in front, knockback the target before stunning it.')
    .addField('Skill 1: ', 'Deal 5290[9479] physical damage to all enemies in front range and stun them. [Aditional 6569 physicla damage to a single enemy in front and decreases that targets action speed for a period of time.')
    .addField('Skill 2: ', 'Deal 3576 physical damage to all enemies within range, reduces phsyical defense of those targets by 23.')
    .addField('EX skill:', 'Increase phsyical attack at the beginning of the battle')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> 2 -> A -> A -> 1]')
    .setFooter('Other Versions of this character: Ayane, Christmas Ayane ')
    ); break;
    case 'x.ayane' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102331.webp')
    .setColor('RANDOM')
    .addField('Christmas Ayane | アヤネ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 46894 physical damage to a single enemy in front, but consumes 9149 of your HP')
    .addField('Skill 1: ', 'Increase own physical attack power by 2552[Further increase physical attack power by ??? and action speed].')
    .addField('Skill 2: ', 'Deal 6475 physical damage to a single enemy in front and knockbacks it by a small amount.')
    .addField('EX skill:', 'Increase your physical attack at the benning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 1 -> 2]')
    .setFooter('Other Versions of this character: Ayane, Christmas Ayane ')
    ); break;
    case 'ayumi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105531.webp')
    .setColor('RANDOM')
    .addField('Ayumi | アユミ')
    .addField('Position:', 'Middle')
    .addField('UB:', 'Deal 4623 physical damage to all enemies in front range and inflicts confuse to those targets.')
    .addField('Skill 1: ', 'Deal 3207[7270] physical damage to all enemies within range and reduce physical attack power of those targets by 500[896].')
    .addField('Skill 2: ', 'Deal 1781 physical damage in front range, inflict stun on those targets.')
    .addField('EX skill:', 'Increase own physical defence at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> A -> 2]')
    .setFooter('Other Versions of this character: Ayumi ')
    ); break;
    case 'chika' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104231.webp')
    .setColor('RANDOM')
    .addField('Chika | チカ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Restore 1854 HP to all allies in front of her, summon a fairy beside the frontmost ally.')
    .addField('Skill 1: ', 'Increase physical attack power of all allies within range, centering on the frontmost ally, by 904[2412 and further increases physical crit chance of all allies affected by 50. Futhermore, recovers 322 HP per second on allies affected by the buff].')
    .addField('Skill 2: ', 'Reduce physical attack power of a single enemy in front by 848.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Chika, Christmas Chika ')
    ); break;
    case 'x.chika' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104231.webp')
    .setColor('RANDOM')
    .addField('Christmas Chika | チカ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Summon three spirit. One spirit performs magic attack, another spirit restores HP of the ally with the lowest HP, the third restores the TP of all allies.')
    .addField('Skill 1: ', 'Increase physical attack power of an ally with the highest physical attack power by 2260. [Further increase physical attack power and physical crit chance of that ally, the physical attack buff increases as the casters magic attack power increases].')
    .addField('Skill 2: ', 'Increase physical defence of allies in range by 102. Aditionally, restore TP of allies in range by 64.')
    .addField('EX skill:', 'Increase magic attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2-> [LOOP -> A -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Chika, Christmas Chika ')
    ); break;
    case 'chloe' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/110831.webp')
    .setColor('RANDOM')
    .addField('Chloe |　クロエ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 39021 physical damage to a single enemy in front.')
    .addField('Skill 1: ', 'Each time Chloe attacks, add a "candy" status to the enemy she attacks. This candy status can stack up to 66. Furthermore, increase own physical attack power by 2145.')
    .addField('Skill 2: ', 'Deal 11166 physical damage to a single enemy in front, the amount of damage inflicted increases as the number of "candy" status increases. Aditionally decreases the target physical defence power by 26.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> [LOOP -> 2 -> A -> A -> 2 -> A]')
    .setFooter('Other Versions of this character: Chloe')
    ); break;
    case 'christina' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/107131.webp')
    .setColor('RANDOM')
    .addField('Christina | クリスティーナ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 34281 physical damage to a single enemy in front and avoid physical attacks for a certain period of time.')
    .addField('Skill 1: ', 'Increase own attack power by 2055. Increase TP by 15.')
    .addField('Skill 2: ', 'Deal 11427 physical damage to a single enemy in front. Reduces own physical defence.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 2 -> A -> 1 -> 2 -> A -> A -> 2 -> 1]')
    .setFooter('Other Versions of this character: Christina, Christmas Christina')
    ); break;
    case 'x.christina' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/107131.webp')
    .setColor('RANDOM')
    .addField('Christmas Christina | クリスティーナ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 53407 physical damage to a single enemy in front, if X.Christina has a coin stack, damage is doubled and is guaranteed hit. If she doesnt have any stack, add 1 stack, otherwise remove 2 stacks. Furthermore, increase own physical attack power by 5364 for 18 seconds.')
    .addField('Skill 1: ', 'Increase physical attack power of all allies by 1490, if X.Christina has a coin stack, effect is doubled and she further increase her own attack power by 5215.')
    .addField('Skill 2: ', 'Jump to the nearest enemy target, deal 17802 physical damage to it, then return to prev position. if X.Christina have a coin stack, deal 20027 physical damage instead and raise all allies TP by 10.')
    .addField('EX skill:', 'Increase own physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 2 -> A -> 1 -> 2 -> A -> A -> 2 -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Christina, Christmas Christina')
    ); break;
    case 'djeeta' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105731.webp')
    .setColor('RANDOM')
    .addField('Djeeta | ジータ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 48818 physical damage to a single enemy in front.')
    .addField('Skill 1: ', 'Deal 10148[22866] physical damage to a single enemy in front.[Aditionally recovers the TP of all allies except herself].')
    .addField('Skill 2: ', 'Recover own TP by 354.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Djeeta')
    ); break;
    case 'emilia' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109931.webp')
    .setColor('RANDOM')
    .addField('Emilia | エミリア')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Recovers the HP of the ally with the lowest HP by 10071. Increase physical and magical defence of all allies by 121')
    .addField('Skill 1: ', 'Deal 8458 magic damage to a single enemy in front. Increase own magic attack power by 1474.')
    .addField('Skill 2: ', 'Deal 4 x 4229 magic damage to single random enemies.')
    .addField('EX skill:', 'Increase own magical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 1 -> A -> 1 -> 2 -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Emilia')
    ); break;
    case 'eriko' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102731.webp')
    .setColor('RANDOM')
    .addField('Eriko | エリコ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 33415 physical damage to a single enemy in front. When this skill kills an enemy, further increase physical attack power by 2543.')
    .addField('Skill 1: ', 'Increase physical attack power by 848[2380 + 10710 and further increase own physical crit chance by 400].')
    .addField('Skill 2: ', 'Deal 8797 physical damage to a single enemy in front and inflict a poison that deals 226.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 2 -> A -> 2 -> A -> 1]')
    .setFooter('Other Versions of this character: Eriko, Valentines Eriko')
    ); break;
    case 'v.eriko' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102731.webp')
    .setColor('RANDOM')
    .addField('Valentines Eriko | エリコ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 27032 physical damage to a single enemy in front.')
    .addField('Skill 1: ', 'Deal 8971 physical damage to a single enemy. The lower Eriko HP is, the higher the damage becomes.')
    .addField('Skill 2: ', 'Consume own HP by 7317 and then increase own physical attack power by 1785.')
    .addField('EX skill:', 'Increase own physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> 1]')
    .setFooter('Other Versions of this character: Eriko, Valentines Eriko')
    ); break;
    case 'grea' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109431.webp')
    .setColor('RANDOM')
    .addField('Grea | グレア')
    .addField('Position:', 'Middle')
    .addField('UB:', 'Deal 19814 magical damage to all enemies in range.')
    .addField('Skill 1: ', 'Deal 12422 to a single enemy in front and becomes invicible during the flight.')
    .addField('Skill 2: ', 'Create a field that deals 1180 magic damage per second.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '[LOOP -> 2 -> A -> 1 -> A -> 2 -> 1 -> A -> A]')
    .setFooter('Other Versions of this character: Grea ')
    ); break;
    case 'hatsune' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101231.webp')
    .setColor('RANDOM')
    .addField('Hatsune | ハツネ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deal 4938 magic damage to all enemies. Aditionally deal 3375 magic damage to them every time they attack.* <- to be confirmed.')
    .addField('Skill 1: ', 'Deal 10000[13491 and further reduces magic defence by 25] magic damage to a single enemy with the highest physical attack power')
    .addField('Skill 2: ', 'Deal 5000 magic damage to a single enemy in front and stun the target.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '2 -> 1 -> [lOOP -> A -> A -> 2 -> A -> 1]')
    .setFooter('Other Versions of this character: Hatsune ')
    ); break;
    case 'hiyori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100131.webp')
    .setColor('RANDOM')
    .addField('Hiyori | ヒヨリ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 14689 physical damage to a single enemy in front. Deal 6610 physical damage to enemies within range.')
    .addField('Skill 1: ', 'Deal 9762 physical damage to a single enemy in front. [Aditionally deal 4474 damage to enemies within range and 9943 to the single enemy in front] <- need confirmation')
    .addField('Skill 2: ', 'Deal 3327 physical damage to a single enemy in front. Furhter increase own physical attack power by 1243. ')
    .addField('EX skill:', 'Increase own physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> A -> 1]')
    .setFooter('Other Versions of this character: Hiyori, New Year Hiyori')
    ); break;
    case 'n.hiyori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100131.webp')
    .setColor('RANDOM')
    .addField('New Year Hiyori | ヒヨリ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 29213 physical damage to a single enemy in front, reduce their physical defence by 24, and further reduce their TP by 20. <- need cofirmation if the TP stat or the TP bar')
    .addField('Skill 1: ', 'Increase own physical attack power by 1071 and increase all allies physical power by 714.')
    .addField('Skill 2: ', 'Deal 10752 damage to a single enemy in front.')
    .addField('EX skill:', 'Increase physical attack power at the beginning of the battle.')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 2 -> 1 -> A -> 2 -> A -> 1 -> A -> A -> 2 -> A]')
    .setFooter('Other Versions of this character: Hiyori, New Year Hiyori')
    ); break;
    case 'illya' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104431.webp')
    .setColor('RANDOM')
    .addField('Illya | イィヤ')
    .addField('Position:', 'Middle')
    .addField('UB:', 'Deal 18512 magic damage to all enemies in ranage and recover own HP by 5964.')
    .addField('Skill 1: ', 'Consumes 6858[8122] of own HP to increase magic attack power by 1507[1703]. Aditionally deal 12712[19519] to a single enemy in front.')
    .addField('Skill 2: ', 'Deal 10284 magic damage to all enemies in range but also consume 6858 of own HP.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> 2 -> 1 -> A -> 2 -> 1 -> A -> A -> 2 -> 1]')
    .setFooter('Other Versions of this character: Illya, Christmas Illya')
    ); break;
    case 'x.illya' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104431.webp')
    .setColor('RANDOM')
    .addField('Christmas Illya | イィヤ')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deal 48259 magic damage to a single enemy in front and increases own magic attack power by 2280. Skill damage increases as Illya HP decreases.')
    .addField('Skill 1: ', 'Deal 16086 magic damage to a single enemy in front. Skill damage increases as Illya HP decreases. ')
    .addField('Skill 2: ', 'Deal 10054 magic damage to all enemies within range and increases own magic attack power by 2280 but consume 20% of own remaining HP. Skill damage increases as Illya HP decreases.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> 1 -> 2 -> A -> 1 -> 2 -> A -> A -> 1 -> 2]')
    .setFooter('Other Versions of this character: Illya, Christmas Illya')
    ); break;
    case 'io' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101831.webp')
    .setColor('RANDOM')
    .addField('Io | イオ')
    .addField('Position:', 'Rear')
    .addField('UB:', 'Deal 2739 magic damage to all enemies and inflict "charm" to affected targets. (6* aditionally reduces the tp of all enemies by a small amount, lowers the tp regenetion by a small amount and exterd "charm" duration).')
    .addField('Skill 1: ', '3432 magic damage to all enemies in front area. [Reduces the TP of enemies with "charmed" effect by 301. Non-charmed enemies recieve a 40 physical and magical attack debuff instead.) ')
    .addField('Skill 2: ', 'Reduces the TP of a single random enemy by 160 and recover own TP by 160.')
    .addField('EX skill:', 'Increase own magic attack power at the beginning of the battle')
    .addField('Attack Pattern:', '1 -> 2 -> [LOOP -> A -> A -> 1 -> A -> 2]')
    .setFooter('Other Versions of this character: Io, Summer Io')
    ); break;
    case 'jun' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104731.webp')
    .setColor('RANDOM')
    .addField('Jun | ジュン')
    .addField('Position:', 'Front')
    .addField('UB:', 'Deploy a 7535 physical/magic absorption barrier to self.')
    .addField('Skill 1: ', 'Recover 3673[5463] HP to a single ally with the lowest HP in range. [Aditionally increases the physical attack power of allies by 1507. Increase attack speed of the recovered ally].')
    .addField('Skill 2: ', 'Deal 3551 physical damage to the nearest enemy and reduce its physical defence by 83.'    )
    .addField('EX skill:', 'Increase own magic defence power at the beginning of the battle')
    .addField('Attack Pattern:', '2 -> 1 -> [LOOP -> A -> A -> 2 -> A -> 1]')
    .setFooter('Other Versions of this character: Jun')
    ); break;
    case 'kaori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101731.webp')
    .setColor('RANDOM')
    .addField('Kaori | カオリ')
    .addField('Name:', 'Kaori', true)
    .addField('Real Name:', 'Kyan Kaori', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '53 kg', true)
    .addField('Birthday:', 'July 7', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Dancing', true)
    .addField('Voice actress:', 'Takamori Natsumi', true)
    
    .setFooter('Other Versions of this character: Kaori, Summer Kaori')
    ); break;
    case 'kasumi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101431.webp')
    .setColor('RANDOM')
    .addField('Kasumi |　カスミ')
    .addField('Name:', 'Kasumi', true)
    .addField('Real Name:', 'Kirihara Kasumi', true)
    .addField('Height:', '152 cm', true)
    .addField('Weight:', '41 kg', true)
    .addField('Birthday:', 'November 3', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Solving Mysteries', true)
    .addField('Voice actress:', 'Minase Inori', true)
    
    .setFooter('Other Versions of this character: Kasumi')
    ); break;
    case 'kokkoro' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105931.webp')
    .setColor('RANDOM')
    .addField('Kokkoro | コッコロ')
    .addField('Name:', 'Kokkoro', true)
    .addField('Real Name:', 'Natsume Kokkoro', true)
    .addField('Height:', '140 cm', true)
    .addField('Weight:', '35 kg', true)
    .addField('Birthday:', 'May 11', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '11', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Plants and animals', true)
    .addField('Voice actress:', 'Itou Miku', true)
    
    .setFooter('Other Versions of this character: Kokkoro, Summer Kokkoro')
    ); break;
    case 'kuuka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104531.webp')
    .setColor('RANDOM')
    .addField('Kuuka | クウカ')
    .addField('Name:', 'Kuuka', true)
    .addField('Real Name:', 'Tohmi Kuuka', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'November 19', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Reading Novels', true)
    .addField('Voice actress:', 'Nagatsuma Juri', true)
    
    .setFooter('Other Versions of this character: Kuuka, Oedo Kuuka')
    ); break;
    case 'kyaru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106031.webp')
    .setColor('RANDOM')
    .addField('Kyaru | キャル')
    .addField('Name:', 'Kyaru', true)
    .addField('Real Name:', 'Momochi Kiruya', true)
    .addField('Height:', '152 cm', true)
    .addField('Weight:', '39 kg', true)
    .addField('Birthday:', 'September 2', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Neko', true)
    .addField('Voice actress:', 'Tachibana Rika', true)
    
    .setFooter('Other Versions of this character: Kyaru, Summer Kyaru')
    ); break;
    case 'kyouka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103631.webp')
    .setColor('RANDOM')
    .addField('Kyouka | キョウカ')
    .addField('Name:', 'Kyouka', true)
    .addField('Real Name:', 'Hikawa Kyouka', true)
    .addField('Height:', '118 cm', true)
    .addField('Weight:', '21 kg', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '8', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Studying', true)
    .addField('Voice actress:', 'Ogura Yui', true)
    
    .setFooter('Other Versions of this character: Kyouka, Halloween Kyouka')
    ); break;
    case 'rima' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105231.webp')
    .setColor('RANDOM')
    .addField('Rima | リマ')
    .addField('Name:', 'Rima', true)
    .addField('Real Name:', 'Rima', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '100 kg', true)
    .addField('Birthday:', 'March 14', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Grooming', true)
    .addField('Voice actress:', 'Tokui Sora', true)
    
    .setFooter('Other Versions of this character: Rima')
    ); break;
    case 'ruka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105631.webp')
    .setColor('RANDOM')
    .addField('Ruka |　ルカ')
    .addField('Name:', 'Ruka', true)
    .addField('Real Name:', 'Tachiarai Ruka', true)
    .addField('Height:', '167 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'July 1', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '25', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', 'Fishing', true)
    .addField('Voice actress:', 'Satou Rina', true)
    
    .setFooter('Other Versions of this character: Ruka')
    ); break;
    case 'mahiru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103331.webp')
    .setColor('RANDOM')
    .addField('Mahiru |　マヒル')
    .addField('Name:', 'Mahiru', true)
    .addField('Real Name:', 'Noto Mahiru', true)
    .addField('Height:', '142 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'March 3', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '20', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Manzai', true)
    .addField('Voice actress:', 'Nitta emi', true)
    
    .setFooter('Other Versions of this character: Mahiru')
    ); break;
    case 'maho' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101031.webp')
    .setColor('RANDOM')
    .addField('Maho | マホ')
    .addField('Name:', 'Maho', true)
    .addField('Real Name:', 'Mimemiya Maho', true)
    .addField('Height:', '155 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'September 22', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Plushies', true)
    .addField('Voice actress:', 'Uchida Maaya', true)
    
    .setFooter('Other Versions of this character: Maho, Summer Maho')
    ); break;
    case 'makoto' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104331.webp')
    .setColor('RANDOM')
    .addField('Makoto | マコト')
    .addField('Name:', 'Makoto', true)
    .addField('Real Name:', 'Aki Makoto', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'August 9', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Kaon', true)
    .addField('Likes', 'Making Pastries', true)
    .addField('Voice actress:', 'Komatsu Mikako', true)
    
    .setFooter('Other Versions of this character: Makoto, Summer Makoto')
    ); break;
    case 'matsuri' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100531.webp')
    .setColor('RANDOM')
    .addField('Matsuri | マツリ')
    .addField('Name:', 'Matsuri', true)
    .addField('Real Name:', 'Orihara Matsuri', true)
    .addField('Height:', '146 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 25', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '12', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Heroes', true)
    .addField('Voice actress:', 'Shimoda Asami', true)
    
    .setFooter('Other Versions of this character: Matsuri')
    ); break;
    case 'mifuyu' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104831.webp')
    .setColor('RANDOM')
    .addField('Mifuyu | ミフユ')
    .addField('Name:', 'Mifuyu', true)
    .addField('Real Name:', 'Ohgami Mifuyu', true)
    .addField('Height:', '163 cm', true)
    .addField('Weight:', '49 kg', true)
    .addField('Birthday:', 'November 11', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '20', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Mercenary Works', true)
    .addField('Voice actress:', 'Tadokoro Azusa', true)
    
    .setFooter('Other Versions of this character: Mifuyu, Summer Mifuyu')
    ); break;
    case 'mimi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102031.webp')
    .setColor('RANDOM')
    .addField('Mimi | ミミ')
    .addField('Name:', 'Mimi', true)
    .addField('Real Name:', 'Akane Mimi', true)
    .addField('Height:', '117 cm', true)
    .addField('Weight:', '21 kg', true)
    .addField('Birthday:', 'April 3', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '10', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Cute things', true)
    .addField('Voice actress:', 'Hidaka Rina', true)
    
    .setFooter('Other Versions of this character: Mimi, Summer Mimi')
    ); break;
    case 'misaki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105031.webp')
    .setColor('RANDOM')
    .addField('Misaki | ミサキ')
    .addField('Name:', 'Misaki', true)
    .addField('Real Name:', 'Tamaizumi Misaki', true)
    .addField('Height:', '120 cm', true)
    .addField('Weight:', '22 kg', true)
    .addField('Birthday:', 'January 3', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '11', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Lucent Academy', true)
    .addField('Likes', 'Cosmetics', true)
    .addField('Voice actress:', 'Kuno Misaki', true)
    
    .setFooter('Other Versions of this character: Misaki, Halloween Misaki')
    ); break;
    case 'misato' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101531.webp')
    .setColor('RANDOM')
    .addField('Misato | ミサト')
    .addField('Name:', 'Misato', true)
    .addField('Real Name:', 'Aikawa Misato', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'September 5', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '21', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Forestier', true)
    .addField('Likes', 'Making Picture Books', true)
    .addField('Voice actress:', 'Kouda Mariko', true)
    
    .setFooter('Other Versions of this character: Misato')
    ); break;
    case 'misogi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100431.webp')
    .setColor('RANDOM')
    .addField('Misogi | ミソギ')
    .addField('Name:', 'Misogi', true)
    .addField('Real Name:', 'Hotaka Misogi', true)
    .addField('Height:', '128 cm', true)
    .addField('Weight:', '27 kg', true)
    .addField('Birthday:', 'August 10', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '9', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Little Lyrical', true)
    .addField('Likes', 'Making Pranks', true)
    .addField('Voice actress:', 'Morohoshi Sumire', true)
    
    .setFooter('Other Versions of this character: Misogi, Halloween Misogi')
    ); break;
    case 'mitsuki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105131.webp')
    .setColor('RANDOM')
    .addField('Mitsuki | ミツキ')
    .addField('Name:', 'Mitsuki', true)
    .addField('Real Name:', 'Yoigahama Mitsuki', true)
    .addField('Height:', '166 cm', true)
    .addField('Weight:', '53 kg', true)
    .addField('Birthday:', 'March 7', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '27', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twilight Caravanu', true)
    .addField('Likes', 'Experiments', true)
    .addField('Voice actress:', 'Mitsuishi Kotono', true)
    
    .setFooter('Other Versions of this character: Mitsuki')
    ); break;
    case 'miyako' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100731.webp')
    .setColor('RANDOM')
    .addField('Miyako | ミヤコ')
    .addField('Name:', 'Miyako', true)
    .addField('Real Name:', 'Izumo miyako', true)
    .addField('Height:', '130 cm', true)
    .addField('Weight:', '32 cm', true)
    .addField('Birthday:', 'January 23', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Pudding', true)
    .addField('Voice actress:', 'Amamiya Sora', true)
    
    .setFooter('Other Versions of this character: Miyako, Halloween Miyako')
    ); break;
    case 'monika' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105331.webp')
    .setColor('RANDOM')
    .addField('Monika | モニカ')
    .addField('Name:', 'Monika', true)
    .addField('Real Name:', 'Monika Weisswind', true)
    .addField('Height:', '140 cm', true)
    .addField('Weight:', '33 kg', true)
    .addField('Birthday:', 'July 28', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Candies', true)
    .addField('Voice actress:', 'Tsuji Ayumi', true)
    
    .setFooter('Other Versions of this character: Monika')
    ); break;
    case 'muimi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/106131.webp')
    .setColor('RANDOM')
    .addField('Muimi | ムイミ')
    .addField('Name:', 'Muimi', true)
    .addField('Real Name:', 'Novem', true)
    .addField('Height:', '148 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'August 11', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Unknown', true)
    .addField('Likes', 'Adventures', true)
    .addField('Voice actress:', 'Han Megumi', true)
    
    .setFooter('Other Versions of this character: Muimi')
    ); break;
    case 'nanaka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101331.webp')
    .setColor('RANDOM')
    .addField('Nanaka | ナナカ')
    .addField('Name:', 'Nanaka', true)
    .addField('Real Name:', 'Tanno Nanaka', true)
    .addField('Height:', '165 cm', true)
    .addField('Weight:', '55 kg', true)
    .addField('Birthday:', 'August 21', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twilight Caravan', true)
    .addField('Likes', 'Reading and Magic', true)
    .addField('Voice actress:', 'Yoshimura Haruka', true)
    
    .setFooter('Other Versions of this character: Nanaka')
    ); break;
    case 'neneka' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/107031.webp')
    .setColor('RANDOM')
    .addField('Neneka | ネネカ')
    .addField('Name:', 'Neneka', true)
    .addField('Real Name:', 'Neneka', true)
    .addField('Height:', '149 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'March 24', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '24', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Unknown', true)
    .addField('Likes', 'Imitating', true)
    .addField('Voice actress:', 'Iguchi Yuka', true)
    
    .setFooter('Other Versions of this character: Neneka')
    ); break;
    case 'ninon' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103031.webp')
    .setColor('RANDOM')
    .addField('Ninon | ニノン')
    .addField('Name:', 'Ninon', true)
    .addField('Real Name:', 'Ninon Joubert', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '51 kg', true)
    .addField('Birthday:', 'August 31', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '16', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Ninjas', true)
    .addField('Voice actress:', 'Satou Satomi', true)
    
    .setFooter('Other Versions of this character: Ninon, Oedo Ninon')
    ); break;
    case 'nozomi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102931.webp')
    .setColor('RANDOM')
    .addField('Nozomi | ノゾミ')
    .addField('Name:', 'Nozomi', true)
    .addField('Real Name:', 'Sakurai Nozomi', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'January 24', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Carmina', true)
    .addField('Likes', 'Dancing', true)
    .addField('Voice actress:', 'Hikasa Youko', true)
    
    .setFooter('Other Versions of this character: Nozomi, Christmas Nozomi')
    ); break;
    case 'pecorine' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105831.webp')
    .setColor('RANDOM')
    .addField('Pecorine |　ペコリーヌ')
    .addField('Name:', 'Pecorine', true)
    .addField('Real Name:', '|| Eustiana von Astraea ||', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'March 31', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Gourmet Guild', true)
    .addField('Likes', 'Eating, Cooking', true)
    .addField('Voice actress:', 'M・A・O', true)
    
    .setFooter('Other Versions of this character: Pecorine, Summer Peocorine')
    ); break;
    case 'ram' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109831.webp')
    .setColor('RANDOM')
    .addField('Ram | ラム')
    .addField('Name:', 'Ram', true)
    .addField('Real Name:', 'Ram', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'N/A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Oni', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Reading', true)
    .addField('Voice actress:', 'Murakawa Rie', true)
    
    .setFooter('Other Versions of this character: Ram')
    ); break;
    case 'rei' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100331.webp')
    .setColor('RANDOM')
    .addField('Rei | レイ')
    .addField('Name:', 'Rei', true)
    .addField('Real Name:', 'Shijou Rei', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '46 kg', true)
    .addField('Birthday:', 'January 12', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Twinkle Wish', true)
    .addField('Likes', 'Reading', true)
    .addField('Voice actress:', 'Hayami Saori', true)
    
    .setFooter('Other Versions of this character: Rei, New Year Rei')
    ); break;
    case 'rem' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/109731.webp')
    .setColor('RANDOM')
    .addField('Rem | レム')
    .addField('Name:', 'Rem', true)
    .addField('Real Name:', 'Rem', true)
    .addField('Height:', '154cm', true)
    .addField('Weight:', 'N/A', true)
    .addField('Birthday:', 'February 2', true)
    .addField('Blood Type:', 'N/A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Oni', true)
    .addField('Guild:', 'Otherworld Visitors', true)
    .addField('Likes', 'Poetry', true)
    .addField('Voice actress:', 'Minase Inori', true)
    
    .setFooter('Other Versions of this character: Rem')
    ); break;
    case 'rin' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102631.webp')
    .setColor('RANDOM')
    .addField('Rin | リン')
    .addField('Name:', 'Rin', true)
    .addField('Real Name:', 'Morichika Rin', true)
    .addField('Height:', '144 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'January 1', true)
    .addField('Blood Type:', 'B', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Red Bean Bread', true)
    .addField('Voice actress:', 'Koiwai Kotori', true)
    
    .setFooter('Other Versions of this character: Rin')
    ); break;
    case 'Rino' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101131.webp')
    .setColor('RANDOM')
    .addField('Rino | リノ')
    .addField('Name:', 'Rino', true)
    .addField('Real Name:', 'Inosaki Rino', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '44 kg', true)
    .addField('Birthday:', 'August 25', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Labyrinth', true)
    .addField('Likes', 'Sewing', true)
    .addField('Voice actress:', 'Asumi Kana', true)
    
    .setFooter('Other Versions of this character: Rino')
    ); break;
    case 'saren' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102831.webp')
    .setColor('RANDOM')
    .addField('Saren | サレン')
    .addField('Name:', 'Saren', true)
    .addField('Real Name:', 'Sasaki Saren', true)
    .addField('Height:', '156 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'October 4', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Sarendia', true)
    .addField('Likes', 'Tea parties', true)
    .addField('Voice actress:', 'Horie Yui', true)
    
    .setFooter('Other Versions of this character: Saren, Summer Saren')
    ); break;
    case 'shinobu' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103131.webp')
    .setColor('RANDOM')
    .addField('Shinobu | シノブ')
    .addField('Name:', 'Shinobu', true)
    .addField('Real Name:', 'Kamiki Shinobu', true)
    .addField('Height:', '157 cm', true)
    .addField('Weight:', '42 kg', true)
    .addField('Birthday:', 'December 22', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Fortune Telling', true)
    .addField('Voice actress:', 'Ootsubo Yuka', true)
    
    .setFooter('Other Versions of this character: Shinobu, Halloween Shinobu')
    ); break;
    case 'shiori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103831.webp')
    .setColor('RANDOM')
    .addField('Shiori | シオリ')
    .addField('Name:', 'Shiori', true)
    .addField('Real Name:', 'Kashiwazaki Shiori', true)
    .addField('Height:', '153 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 3', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Elizabeth Park', true)
    .addField('Likes', 'Reading Books', true)
    .addField('Voice actress:', 'Koshimizu Ami', true)
    
    .setFooter('Other Versions of this character: Shiori')
    ); break;
    case 'shizuru' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104931.webp')
    .setColor('RANDOM')
    .addField('Shizuru | シズル')
    .addField('Name:', 'Shizuru', true)
    .addField('Real Name:', 'Hoshino Shizuru', true)
    .addField('Height:', '168 cm', true)
    .addField('Weight:', '54 kg', true)
    .addField('Birthday:', 'October 24', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '18', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Labyrinth', true)
    .addField('Likes', 'Houseworks', true)
    .addField('Voice actress:', 'Nabatame Hitomi', true)
    
    .setFooter('Other Versions of this character: Shizuru, Valentine Shizuru')
    ); break;
    case 'suzume' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/102531.webp')
    .setColor('RANDOM')
    .addField('Suzume | スズメ')
    .addField('Name:', 'Suzume', true)
    .addField('Real Name:', 'Amano Suzume', true)
    .addField('Height:', '154 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'December 12', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '15', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Sarendia', true)
    .addField('Likes', 'Any kind of service', true)
    .addField('Voice actress:', 'Yuuki Aoi', true)
    
    .setFooter('Other Versions of this character: Suzume, Summer Suzume')
    ); break;
    case 'suzuna' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/101631.webp')
    .setColor('RANDOM')
    .addField('Suzuna | スズナ')
    .addField('Name:', 'Suzuna', true)
    .addField('Real Name:', 'Minami Suzuna', true)
    .addField('Height:', '167 cm', true)
    .addField('Weight:', '48 kg', true)
    .addField('Birthday:', 'April 10', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Lucent Academy', true)
    .addField('Likes', 'Fashion', true)
    .addField('Voice actress:', 'Uesaka Sumire', true)
    
    .setFooter('Other Versions of this character: Suzuna, Summer Suzuna')
    ); break;
    case 'tamaki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/104631.webp')
    .setColor('RANDOM')
    .addField('Tamaki | タマキ')
    .addField('Name:', 'tamaki', true)
    .addField('Real Name:', 'Miyasaka Tamaki', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '48 kg', true)
    .addField('Birthday:', 'March 1', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '19', true)
    .addField('Species:', 'Beast', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Nekos', true)
    .addField('Voice actress:', 'Numakura Manami', true)
    
    .setFooter('Other Versions of this character: Tamaki, Summer Tamaki')
    ); break;
    case 'tomo' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103731.webp')
    .setColor('RANDOM')
    .addField('Tomo | トモ')
    .addField('Name:', 'Tomo', true)
    .addField('Real Name:', 'Mikuma Tomo', true)
    .addField('Height:', '149 cm', true)
    .addField('Weight:', '43 kg', true)
    .addField('Birthday:', 'August 11', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Nightmare', true)
    .addField('Likes', 'Fencing', true)
    .addField('Voice actress:', 'Chihara Minori', true)
    
    .setFooter('Other Versions of this character: Tomo')
    ); break;
    case 'tsumugi' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/105431.webp')
    .setColor('RANDOM')
    .addField('Tsumugi | ツムギ')
    .addField('Name:', 'Tsumugi', true)
    .addField('Real Name:', 'Mayumiya Tsumugi', true)
    .addField('Height:', '153 cm', true)
    .addField('Weight:', '45 kg', true)
    .addField('Birthday:', 'September 7', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Carmina', true)
    .addField('Likes', 'Tailoring', true)
    .addField('Voice actress:', 'Kido Ibuki', true)
    
    .setFooter('Other Versions of this character: Tsumugi')
    ); break;
    case 'yori' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100131.webp')
    .setColor('RANDOM')
    .addField('Yori | ヨリ')
    .addField('Name:', 'Yori', true)
    .addField('Real Name:', 'Kazemiya Yori', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'November 22', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '13', true)
    .addField('Species:', 'Demon', true)
    .addField('Guild:', 'Diabolos', true)
    .addField('Likes', 'Games', true)
    .addField('Voice actress:', 'Hara Sayuri', true)
    
    .setFooter('Other Versions of this character: Yori')
    ); break;
    case 'yui' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100231.webp')
    .setColor('RANDOM')
    .addField('Yui | ユイ')
    .addField('Name:', 'Yui', true)
    .addField('Real Name:', 'Kusano Yui', true)
    .addField('Height:', '158 cm', true)
    .addField('Weight:', '47 kg', true)
    .addField('Birthday:', 'April 5', true)
    .addField('Blood Type:', 'O', true)
    .addField('Age:', '17', true)
    .addField('Species:', 'Human', true)
    .addField('Guild:', 'Twinkle Wish', true)
    .addField('Likes', 'Being a Housewife', true)
    .addField('Voice actress:', 'Taneda Risa', true)
    
    .setFooter('Other Versions of this character: Yui, New Year Yui')
    ); break;
    case 'yukari' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/103431.webp')
    .setColor('RANDOM')
    .addField('Yukari | ユカリ')
    .addField('Name:', 'Yukari', true)
    .addField('Real Name:', 'Ayase Yukari', true)
    .addField('Height:', '164 cm', true)
    .addField('Weight:', '55 kg', true)
    .addField('Birthday:', 'March 16', true)
    .addField('Blood Type:', 'A', true)
    .addField('Age:', '22', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Mercurius Foundation', true)
    .addField('Likes', 'Shopping', true)
    .addField('Voice actress:', 'Imai Asami', true)
    
    .setFooter('Other Versions of this character: Yukari')
    ); break;
    case 'yuki' : message.channel.send(new Discord.RichEmbed()
    .setThumbnail('https://redive.estertion.win/icon/unit/100831.webp')
    .setColor('RANDOM')
    .addField('Yuki | ユキ')
    .addField('Name:', 'Yuki', true)
    .addField('Real Name:', 'Nijimura Yuki', true)
    .addField('Height:', '150 cm', true)
    .addField('Weight:', '40 kg', true)
    .addField('Birthday:', 'October 10', true)
    .addField('Blood Type:', 'AB', true)
    .addField('Age:', '14', true)
    .addField('Species:', 'Elf', true)
    .addField('Guild:', 'Weissflugel', true)
    .addField('Likes', 'Mirrors', true)
    .addField('Voice actress:', 'Ohzora Naomi', true)
    
    .setFooter('Other Versions of this character: Yuki')
    ); break;


    default: message.channel.send('**No matches.** For Characters that have alternative versions (i.e Halloween Kyouka, Student Aoi), use the first letter of the Character version followed by a dot(.) then the name of the character (i.e. Halloween Kyouka = H.Kyouka)')
  }
}

});
 


client.login(config.token);
