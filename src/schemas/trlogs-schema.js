const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: reqString,
  channel_id: reqString,
  message_id: reqString,
  emoji: reqString,
});

const Model = mongoose.model("logs-translation", Schema);

module.exports = {
  isTranslated: async (message, code) => {
    return await Model.findOne({
      guild_id: message.guildId,
      channel_id: message.channelId,
      message_id: message.id,
      emoji: code,
    }).lean();
  },

  logTranslation: async (message, code) => {
    return new Model({
      guild_id: message.guildId,
      channel_id: message.channelId,
      message_id: message.id,
      emoji: code,
    }).save();
  },
};
