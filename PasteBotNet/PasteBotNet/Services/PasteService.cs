using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Discord;
using Discord.Commands;
using Discord.WebSocket;
using Microsoft.Extensions.Configuration;
using PasteMystNet;

namespace PasteBotNet.Services
{
    public class PasteService
    {
        private readonly DiscordSocketClient _discord;
        private static readonly Regex Regex = new(@"(\`{3}[a-z]*\n[\s\S]*?\n\`{3})");
        
        private readonly CommandService _commands;
        private readonly IConfigurationRoot _config;
        private readonly IServiceProvider _provider;

        
        public PasteService(
            DiscordSocketClient discord,
            CommandService commands,
            IConfigurationRoot config,
            IServiceProvider provider)
        {
            _discord = discord;
            _commands = commands;
            _config = config;
            _provider = provider;

            _discord.MessageReceived += OnMessageReceivedAsync;
        }


        private async Task OnMessageReceivedAsync(SocketMessage s)
        {
            #region checks
            
            if (!(s is SocketUserMessage msg)) return;
            if (msg.Author.Id == _discord.CurrentUser.Id) return;
            var msgWrappedLineCount = msg.Content
                .Split(new[] {'\n', '\r'})
                .Select(l => (int)Math.Ceiling(l.Length / 47f)) // This could be turned into parameter, currently it's amount of characters that fit on mobile with 100% scale
                .Sum();
            if (!IsCodeBlock(msg.Content)) return;
            if (msgWrappedLineCount <= 20) return;

            #endregion
            
            var language = string.Empty;
            var code = string.Empty;
            
            var matches = Regex.Matches(msg.Content);
            foreach (var match in matches)
            {
                var lines = Regex.Split(match.ToString()!, "\r\n|\r|\n").ToList();
                lines[0] = lines[0].TrimStart('`');
                
                if (lines[0].Length > 0)
                    language = lines[0];
                lines.RemoveAt(0);
                lines.RemoveAt(lines.Count - 1);
                code = string.Join("\r\n", lines);
            }
            
            var paste = new PasteMystPasteForm { ExpireDuration = PasteMystExpiration.OneHour };
            var pasties = new List<PasteMystPastyForm>();
            foreach (var match in matches)
            {
                var pasty = new PasteMystPastyForm { Code = code };
                if (!string.IsNullOrWhiteSpace(language))
                {
                    var pasteMystLanguage = await PasteMystLanguage.IdentifyByExtensionAsync(language);
                    pasty.Language = pasteMystLanguage?.Name ?? "autodetect";
                }

                pasties.Add(pasty);
            }
            paste.Pasties = pasties.ToArray();
            var result = await paste.PostPasteAsync();
            
            var link = $"https://paste.myst.rs/{result.Id}";

            var resultEmbed = new EmbedBuilder()
                .WithAuthor("Pasted!", msg.Author.GetAvatarUrl(), link)
                .WithDescription(
                    $"Code block by {msg.Author.Mention} was pasted on pastemyst!\n[Click here to view it!]({link})")
                .WithColor(Color.Green)
                .Build();

            await msg.Channel.SendMessageAsync(embed: resultEmbed);
            await msg.DeleteAsync();
        }
        
        private static bool IsCodeBlock(string content)
            => Regex.IsMatch(content);
    }
}