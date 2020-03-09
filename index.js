// Load up the discord.js library
const Discord = require("discord.js");
const Sequelize = require('sequelize');
// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
const bot = client
const { Client, RichEmbed } = require('discord.js');

// Here we load the config.json file that contains our token and our prefix values. 

const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message   prefix.

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
      
		}  else if (command === "tag") {
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
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").

  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  // *if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  } 
  if(command === "PLACEHOLDER FOR NEW COMMANDS") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = "<:KyoukaPout:634276917939273768>";
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  } 
  if(command === "clanbattleinfo") {

    message.channel.send("Kyouka Funclub - Clan Battle Info Folder: https://drive.google.com/drive/folders/1Lufya5iJKhAFZYXOmpLlwb_0HOU6iMDt?usp=sharing");
  }
  if(command === "f") {
    const user = message.author;

    return message.channel.send(`${user.username} has paid their respects. <:MahoHeart:634280442446479370>`);
  }

  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example I just hardcode the role names.
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
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
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
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
   if(!message.member.roles.some(r=>["Pecorine Fucker"].includes(r.name)) )
    return message.reply("Sorry, you don't have permissions to use this!");
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

// THIS BLOCK OF CODE FOR THOSE WITHOUT PREFIX
client.on("message", (message) => {

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
  if(message.content.toLowerCase()=== "kyouka, send nudes") {
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/452127517734862850/642668977390223401/Kyoukalood.gif"]})
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
    message.channel.send({files: ["https://cdn.discordapp.com/attachments/452127517734862850/642668977390223401/Kyoukalood.gif"]})
  }
  });

// THIS BLOCK OF CODE IS FOR HEADPATS
client.on("message", (message) => {
  let prefix = false;
  const prefixes = ['kyouka ', '+'];
  for(const thisPrefix of prefixes) {
    if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;

  }
  if(!prefix) return;

  if (message.author.bot) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  
pat1 = "https://media1.tenor.com/images/005e8df693c0f59e442b0bf95c22d0f5/tenor.gif?itemid=10947495";
pat2 = "https://media1.tenor.com/images/f5176d4c5cbb776e85af5dcc5eea59be/tenor.gif?itemid=5081286"; 
pat3 = "https://media1.tenor.com/images/f330c520a8dfa461130a799faca13c7e/tenor.gif?itemid=13911345";
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
  .setImage(pat1)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 2 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat2)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 3 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat3)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 5 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat4)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 4 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat5)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 6 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat6)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 7 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat7)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 8 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat8)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 9 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat9)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  case 10 :message.channel.send(new Discord.RichEmbed()
  .setImage(pat10)); message.channel.send(`${mentionUser}, you got a pat from ${mentionAuthor}.`); break;
  }
}
});
client.login(config.token);
