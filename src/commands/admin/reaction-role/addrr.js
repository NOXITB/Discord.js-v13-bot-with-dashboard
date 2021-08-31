const { Command, CommandContext } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { addReactionRole } = require("@schemas/reactionrole-schema");
const { Util } = require("discord.js");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class AddReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "addrr",
      description: "setup reaction role for the specified message",
      usage: "<#channel> <messageid> <emote> <role>",
      minArgsCount: 4,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, args } = ctx;

    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) return message.reply("Incorrect usage! You need to mention a target channel");
    if (!targetChannel.permissionsFor(guild.me).has()) {
      return message.reply(
        "You need the following permissions in " + targetChannel.toString() + "\n" + this.parsePermissions(channelPerms)
      );
    }

    let targetMessage;
    try {
      targetMessage = await targetChannel.messages.fetch(args[1]);
    } catch (ex) {
      return message.reply("Could not fetch message. Did you provide a valid messageId?");
    }

    const role = findMatchingRoles(guild, args[3])[0];
    if (!role) return message.reply(`No roles found matching ${args[3]}`);
    if (guild.me.roles.highest.position < role.position)
      return message.reply("Oops! I cannot add/remove members to that role. Is that role higher than mine?");

    let custom = Util.parseEmoji(args[2]);
    if (custom.id && !guild.emojis.cache.has(custom.id)) {
      return await message.reply("This emoji does not belong to this server");
    }

    const emoji = custom.id ? custom.id : custom.name;
    try {
      await targetMessage.react(emoji);
    } catch (ex) {
      return message.reply("Oops! Failed to react. Is this a valid emoji: " + args[2] + " ?");
    }

    addReactionRole(guild.id, targetChannel.id, targetMessage.id, emoji, role.id)
      .then((_) => ctx.reply("Done! Configuration saved"))
      .catch((err) => message.reply("Oops! An unexpected error occurred. Try again later"));
  }
};
