using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Discord;
using Discord.WebSocket;
using PasteMystNet;

namespace PasteBotNet.Services
{
    public class PasteService
    {
        private readonly DiscordSocketClient _discord;
        private static readonly Regex Regex = new(@"(\`{3}[a-z]*\n[\s\S]*?\n\`{3})");
        
        public PasteService(DiscordSocketClient discord)
        {
            _discord = discord;
            _discord.MessageReceived += CheckMessage;
        }


        private async Task CheckMessage(SocketMessage s)
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

            var link = await PasteMessage(msg);
            var resultEmbed = new EmbedBuilder()
                .WithAuthor("Pasted!", msg.Author.GetAvatarUrl(), link)
                .WithDescription(
                    $"Code block by {msg.Author.Mention} was pasted on pastemyst!\n[Click here to view it!]({link})")
                .WithColor(Color.Green)
                .Build();

            await msg.Channel.SendMessageAsync(embed: resultEmbed);
            await msg.DeleteAsync();
        }

        private static async Task<string> PasteMessage(IMessage msg)
        {
            #region extraction
            
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
            
            #endregion

            #region pasting

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

            #endregion
            
            return $"https://paste.myst.rs/{result.Id}";
        }
        
        private static bool IsCodeBlock(string content)
            => Regex.IsMatch(content);
    }
}