const { Client, Collection } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const path = require("path");
const fs = require("fs");
const { getSettings } = require("@schemas/guild-schema");
const { sendMessage } = require("@utils/botUtils");

const COMMAND_INDEX = new Collection();
/**
 * @type {Command[]}
 */
const COMMANDS = [];

/**
 * @param {Client} client
 */
function run(client) {
  const readCommands = (dir) => {
    const files = fs.readdirSync(path.join(__appRoot, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__appRoot, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else {
        const cmdClass = require(path.join(__appRoot, dir, file));
        const command = new cmdClass(client);
        addCommand(command);
      }
    }
  };

  readCommands("src/commands");

  client.on("messageCreate", async (message) => {
    if (message.channel.type === "DM" || message.author.bot || !message.guild) return;

    const settings = await getSettings(message.guild);
    const prefix = settings.prefix;

    if (!message.content.startsWith(prefix)) return;

    let args = message.content.replace(`${prefix}`, "").split(/\s+/);
    const invoke = args.shift().toLowerCase();
    const cmd = getCommand(invoke);

    if (cmd) {
      const ctx = new CommandContext(message, args, invoke, prefix);
      try {
        await cmd.execute(ctx);
      } catch (ex) {
        sendMessage(message.channel, "Oops! An error occurred while running the command");
        console.log(ex);
      }
    }
  });
}

/**
 * @param {Command} cmd
 */
function addCommand(cmd) {
  const index = COMMANDS.length;

  if (COMMAND_INDEX.has(cmd.name)) {
    throw new Error(`Command ${cmd.name} already registered`);
  }

  cmd.aliases.forEach((alias) => {
    if (COMMAND_INDEX.has(alias)) {
      throw new Error(`Alias ${alias} already registered`);
    }
    COMMAND_INDEX.set(alias.toLowerCase(), index);
  });

  COMMAND_INDEX.set(cmd.name.toLowerCase(), index);
  COMMANDS.push(cmd);
}

/**
 * @param {String} invoke
 */
function getCommand(invoke) {
  const index = COMMAND_INDEX.get(invoke.toLowerCase());
  return index != null ? COMMANDS[index] : null;
}

module.exports = {
  run,
  getCommand,
  COMMANDS,
};
