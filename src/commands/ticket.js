module.exports = {
  info: {
    name: 'Ticket',
    desc: 'Create a new ticket',
    help: 'ticket [Optional message]',
    uses: [
      'ticket',
      'new'
    ]
  },
  execute: (bot, r, msg, args) => {
    r.table('tickets').getAll(msg.author.id, { index: 'user' }).run((err, callback) => {
      console.log(callback);
      for (call in callback) {
        console.log(callback[call]);
        if (err) return bot.error(err.stack);
        if (callback[call] && (callback[call].length !== 0)) {
          if (!callback[call].closed) {
            msg.channel.createMessage(':x: | You already have an open ticket (<#' + callback[call].id + '>)');
            return;
          }
        }
      }
      r.table('tickets').orderBy({index: r.desc('case')}).run((err, callback) => {
        if (err) return bot.error(err.stack);
        msg.channel.guild.createChannel('ticket-' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4), 0, 'New ticket', bot.config.category).then((channel) => {
          r.table('tickets').insert({
            user: msg.author.id,
            case: (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4),
            id: channel.id
          }).run();
          const embed = new RichEmbed()
          .setTitle('ID: ' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4))
          .setColor(0xFF0000)
          .setDescription('Message: ' + (args.length > 0 ? args.join(' ') : 'None'));
          channel.send(embed);
        }).catch((err) => {
          bot.error(err.stack);
          msg.channel.createMessage(':x: | An error has occurred!');
        });
      });
    });
  }
}