const Discord = require('discord.js');
const config = require('./config.json');
const pastemyst = require('pastemyst')

const client = new Discord.Client();
const pattern = /(`{3}.*\n([\n]|.)*?\n`{3})/g

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (message.author.bot || isCodeBlock(message.content)) return;
	let link = pasteMessage(message.content);
	let embed = Discord.MessageEmbed()
		.setColor("#2aabde")
		.setAuthor("Pasted!", message.author.avatarURL(), link)
		.setDescription(`Code block by <@${message.author.id}> was pasted on pastemyst!\n[Click here to view it!](${link})`);
	message.channel.send(embed)
	message.delete();
});

function isCodeBlock(msg) {
	return msg.match(pattern) !== []
}

function pasteMessage(msg){
	let language = "";
	let code = "";

	let matches = msg.match(pattern);
	for (let match in matches) {
		let lines = match.split("\n");
		lines[0] = lines[0].replace(/`{3}/g, "").trim();

		if (lines[0].length > 0) {
			language = lines[0];
		}

		lines.splice(0, 1);
		lines.pop();
	}

	let pasties = [];
	for (match in matches) {
		let pasty = {
			code: code,
			language: pastemyst.Languages.Autodetect
		}
		if (language !== "") {
			new pastemyst.GetLanguageByExtension(language)
				.getLanguage()
				.then((res) => pasty.language = res.name);
		}
		pasties.push(pasty);
	}

	let link = ""
	new pastemyst.CreatePasteMyst(
		"(Untitled)",
		pastemyst.ExpiresOptions.OneHour,
		pasties
	)
		.createPaste()
		.then((res) => link = `https://paste.myst.rs/${res.id}`);

	return link;
}

client.login(config.token);