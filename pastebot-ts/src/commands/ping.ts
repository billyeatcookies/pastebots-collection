import { Client, Message, MessageEmbed } from 'discord.js';
import { Command } from '..';

export default new Command({
  name: `ping`,
  description: `Gives you the ping of the bot in miliseconds`,
  usage: `{p}ping`,
  example: `{p}ping`,
  async execute(bot: Client, msg: Message, args: Array<String>, help: MessageEmbed) 
  {
    const pinging: Message = await msg.channel.send(`🏓 Pinging...`);

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(`#3B88C3`)
      .setTitle(`🏓 Pong!`)
      .setDescription(`Bot Latency is **${Math.floor(pinging.createdTimestamp - msg.createdTimestamp)} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`);

    pinging.delete();
    await msg.channel.send(embed);
  },
});