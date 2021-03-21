import re

import discord
import pastemyst
from discord.ext import commands

regex = "(\`{3}[a-z]*\n[\s\S]*?\n\`{3})"
client = pastemyst.Client(key='')


def is_code_block(msg):
    return re.findall(regex, msg) != []


class Paste(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, msg):
        if (msg.author.id == self.bot.user.id) or not (is_code_block(msg.content)):
            return
        # msg_wrapped_line_count = re.split('\n', msg.Content)[]
        link = await self.paste_message(msg.content)
        embed = discord.Embed(
            description=f"Code block by {msg.author.mention} was pasted on pastemyst!" +
                        f"\n[Click here to view it!]({link})",
            color=discord.Color.green()
        ).set_author(name="Pasted!", url=link, icon_url=msg.author.avatar_url)
        await msg.channel.send(embed=embed)
        await msg.delete()

    @staticmethod
    async def paste_message(msg):
        # language = ""
        code = ""

        matches = re.findall(regex, msg)

        for match in matches:
            lines = re.split("\n", match)
            # lines[0] = lines[0].lstrip("`")
            #
            # if len(lines[0]) > 0:
            #     language = lines[0]
            lines.pop(0)
            lines.pop(len(lines) - 1)
            code = "\n".join(lines)

        paste = pastemyst.Paste(expires_in=pastemyst.ExpiresIn.ONE_HOUR)
        pasties = []

        for match in matches:
            pasty = pastemyst.Pasty(code=code)
            pasty.language = pastemyst.Language.AUTODETECT
            # if not language.isspace() or language.strip():
            #     pastemyst_language = client.get_language_info(ext=language)
            #     pasty.language = pastemyst_language.name
            pasties.append(pasty)

        paste.pasties = pasties
        result = client.create_paste(paste=paste)

        return f"https://paste.myst.rs/{result._id}"


def setup(bot):
    bot.add_cog(Paste(bot))
