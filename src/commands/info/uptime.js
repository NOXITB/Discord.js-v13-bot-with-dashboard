const { Command, CommandContext } = require("@src/structures");
const { timeformat } = require("@utils/miscUtils");

module.exports = class UptimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "shows bot's uptime",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    ctx.reply("My Uptime: `" + timeformat(process.uptime()) + "`");
  }
};
