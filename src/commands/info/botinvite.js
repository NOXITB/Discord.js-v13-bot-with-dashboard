const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { BOT_INVITE, SUPPORT_SERVER, EMBED_COLORS } = require("@root/config.js");

module.exports = class BotInviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botinvite",
      description: "get the bot's invite",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    let desc = "";
    desc += `Support Server: [Join here](${SUPPORT_SERVER})` + "\n";
    desc += `Invite Link: [Add me here](${BOT_INVITE})`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Wew! I made it threw the ~waves~")
      .setDescription(desc);

    try {
      await message.author.send({ embeds: [embed] });
      message.reply("Check your DM for my invite :envelope_with_arrow:");
    } catch (ex) {
      console.log(ex);
      message.reply("I cannot send you an invite! Is your DM open?");
    }
  }
};
