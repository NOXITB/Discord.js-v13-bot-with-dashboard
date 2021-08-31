const { Command, CommandContext } = require("@src/structures");
const { getEffectiveInvites } = require("@features/invite-tracker");
const { getDetails } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed } = require("discord.js");
const outdent = require("outdent");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class InviterCommand extends Command {
  constructor(client) {
    super(client, {
      name: "inviter",
      description: "shows inviter information",
      usage: "[@member|id]",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = (await resolveMember(message, args[0])) || message.member;

    const inviteData = await getDetails(message.guild.id, target.id);
    if (!inviteData || !inviteData.inviter_id) return ctx.reply(`Cannot track how \`${target.user.tag}\` joined`);

    let inviter = await message.client.users.fetch(inviteData.inviter_id, false, true);
    let inviterData = await getDetails(message.guild.id, inviteData.inviter_id);

    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor(`Invite data for ${target.displayName}`)
      .setDescription(outdent`
      Inviter: \`${inviter?.tag || "Deleted User"}\`
      Inviter ID: \`${inviteData.inviter_id}\`
      Invite Code: \`${inviteData.invite_code}\`
      Inviter Invites: \`${getEffectiveInvites(inviterData)}\`
      `);

    ctx.reply({ embeds: [embed] });
  }
};
