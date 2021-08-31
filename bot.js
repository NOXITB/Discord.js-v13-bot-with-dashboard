require("module-alias/register");

const { Client, Intents } = require("discord.js");
const path = require("path");
const fs = require("fs");
const mongo = require("@database/mongo");
const ascii = require("ascii-table");
const { startupCheck } = require("@utils/botUtils");
const { BOT_TOKEN, DASHBOARD } = require("@root/config");
const { launch } = require("@root/dashboard/app");

global.__appRoot = path.resolve(__dirname);
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["USER", "MESSAGE", "REACTION"],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  await mongo();
  loadFeatures(client);
  if (DASHBOARD.enabled) launch(client);
});

const loadFeatures = (client) => {
  let table = new ascii("Loading Features");
  table.setHeading("Feature", "Status");
  const readFeatures = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) readFeatures(path.join(dir, file));
      else {
        const feature = require(path.join(__dirname, dir, file));
        try {
          feature.run(client);
          table.addRow(file, "\u2713");
        } catch (ex) {
          table.addRow(file, "\u2715");
          console.log(ex);
        }
      }
    }
  };
  readFeatures("src/features");
  console.log(table.toString());
};

// catch client errors and warnings
client.on("error", (error) => console.log("Client Error: " + error));
client.on("warn", (message) => console.log("Client Warning: " + message));

// find unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", reason.stack || reason);
});

(async () => {
  await startupCheck();
  client.login(BOT_TOKEN);
})();
