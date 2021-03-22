import { Client, Message, MessageEmbed } from 'discord.js';
import { ArgumentType, Command, commands, testArgument, config, CommandType } from '..';

let recentCommands: Array<string> = [];

export default async (bot: Client, msg: Message) =>
{
  if (msg.author.bot) return;

  let args: Array<string> = msg.content.substring(config.PREFIX.length).match(/\\?.|^$/g).reduce((p: any, c) => 
  {
    if(c === '"')
    {
      p.quote ^= 1;
    }else if(!p.quote && c === ' ')
    {
      p.a.push('');
    }else
    {
      p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
    }
    return p;
  }, {a: ['']}).a;

  let message: string = msg.content.substring(0);

  if (message.substring(0, config.PREFIX.length) == config.PREFIX) 
  {
    if (commands.has(args[0])) 
    {
      try 
      {
        const command: Command = commands.get(args[0]) || commands.find(cmd => cmd.aliases.includes(args[0]));
        if(command.type == CommandType.DM && msg.guild)
        {
          return msg.channel.send('This command can only be used in DMs!');
        }
        if((command.type == CommandType.Guild || command.admin) && !msg.guild)
        {
          return msg.channel.send('This command can only be used in a guild!');
        }
        if(recentCommands.includes(`${msg.author.id}-${args[0]}`)){
          return msg.channel.send('Please wait a while before using this command again.');
        }
        if (command.admin && !await msg.member.hasPermission('MANAGE_GUILD')) 
        {
          return msg.channel.send(`Access denied.`);
        }

        const embed: MessageEmbed = new MessageEmbed()
          .setTitle(`Command: ${config.PREFIX}${args[0]}`)
          .setDescription(
            `**Description: **`
            + command.description.replace(/{p}/g, config.PREFIX)
            + `\n`

            + (command.aliases.length > 0 ? 
              `**Aliases: **\n`
              + command.aliases.join(' ')
              + '\n':
              '')
    
            + `**Usage: **`
            + (command.usage.includes(`\n`) ? `\n` : ``)
            + command.usage.replace(/{p}/g, config.PREFIX).replace(/(?<=\n) +/g, '')
            + `\n`
    
            + `**Examples: **`
            + (command.example.includes(`\n`) ? `n` : ``)
            + command.example.replace(/{p}/g, config.PREFIX).replace(/(?<=\n) +/g, '')
          )

        if (command.args.some((argTypes, index) => 
              {
                if(!Array.isArray(argTypes)){
                  argTypes = [argTypes as unknown as ArgumentType];
                }
                return (argTypes as Array<ArgumentType>).some(argType => testArgument(argType, args[index]));
              }
            )
          ) 
        {
          return msg.channel.send(embed);
        }
        recentCommands.push(`${msg.author.id}-${args[0]}`);

        setTimeout(() => 
          {
            recentCommands = recentCommands.filter(r => r != `${msg.author.id}-${args[0]}`);
          },  
          command.cd
        );

        await command.execute(bot, msg, args.slice(1), embed, () => 
          {
            recentCommands = recentCommands.filter(r => r != `${msg.author.id}-${args[0]}`);
          }
        );

      } catch (err) 
      {
        console.error(err);
        msg.channel.send(`There was an error trying to execute the ${args[0]} command! Please contact the admins.`).catch(()=>{});
      }
    }
  }
};