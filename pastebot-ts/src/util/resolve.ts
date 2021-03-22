import { Channel, Guild, GuildMember, Role, TextChannel, User } from "discord.js";
import { bot } from "..";

export function resolveMember(value: string, guild: Guild): GuildMember{
    if(value.slice(0, 2) == '<@' && value[20] == '>' && !isNaN(+value.slice(2, 20))){
        value = value.slice(2, 20);
    }
    return guild.members.cache.get(value) 
        || guild.members.cache.find(member => member.user.username == value || member.nickname == value);
}

export function resolveUser(value: string): User{
    if(value.slice(0, 2) == '<@' && value[20] == '>' && !isNaN(+value.slice(2, 20))){
        value = value.slice(2, 20);
    }
    return bot.users.cache.get(value) 
        || bot.users.cache.find(user => user.username == value);
}

export function resolveChannel(value: string, guild: Guild): Channel{
    if(value.slice(0, 2) == '<#' && value[20] == '>' && !isNaN(+value.slice(2, 20))){
        value = value.slice(2, 20);
    }
    return guild.channels.cache.get(value) 
        || guild.channels.cache.find(Channel => Channel.name == value);
}

export function resolveRole(value: string, guild: Guild): Role{
    if(value.slice(0, 3) == '<@&' && value[21] == '>' && !isNaN(+value.slice(3, 21))){
        value = value.slice(3, 21);
    }
    return guild.roles.cache.get(value) 
        || guild.roles.cache.find(Channel => Channel.name == value);
}