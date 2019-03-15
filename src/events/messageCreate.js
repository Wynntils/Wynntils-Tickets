module.exports = (bot, r) => {
  bot.on('messageCreate', (msg) => {
    if (!bot.ready || !msg || !msg.author || msg.author.bot) return;
    if (!msg.content.startsWith(bot.config.prefix)) return;
    if (msg.channel.guild.id !== bot.config.server) return;
    const command = bot.commands.filter((c) => c.info.uses.includes(msg.content.split(' ')[0].replace(bot.config.prefix, '').toLowerCase()));
    if (command.length < 1) return;
    if (!msg.channel.guild) return;
    try {
      command[0].execute(bot, r, msg, msg.content.replace(bot.config.prefix, '').split(' ').slice(1));
    } catch (e) {
      msg.channel.createMessage(':x: │ An error occurred while running that command!');
      bot.logger.error(e);
    }
  });

  // Listen for ticket replies
  bot.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (msg.channel.parentID !== bot.config.category) return;
    let id = msg.channel.name.split("-").slice(-1)[0];
    r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
      if (!callback) {
        require('crypto').randomBytes(48, (err, buffer) => {
          r.table('chatlogs').insert({
            id: msg.channel.id,
            secret: buffer.toString('hex'),
            case: id,
            logs: [
              {
                id: msg.author.id,
                user: msg.author.username + '#' + msg.author.discriminator,
                content: msg.content
              }
            ]
          }).run();
        });
      } else {
        callback.logs.push({
          id: msg.author.id,
          user: msg.author.username + '#' + msg.author.discriminator,
          content: msg.content
        });
        r.table('chatlogs').get(msg.channel.id).update(callback).run();
      }
    });
  });
};
