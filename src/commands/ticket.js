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
      // console.log(callback);
      for (call in callback) {
        // console.log(callback[call]);
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
        msg.channel.guild.createChannel('ticket-' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4), 0, 'New ticket', bot.config.category).then(channel => {
          channel.editPermission(msg.channel.guild.id, 0, 3072, "role", "New Ticket");
          let Support = msg.channel.guild.roles.find(role => role.name === "Support Team");
          channel.editPermission(Support.id, 3072, 0, "role", "New Ticket");
          channel.editPermission(msg.author.id, 3072, 0, "member", "New Ticket");
          msg.channel.edit({ topic: 'Message: ' + (args.length > 0 ? args.join(' ') : 'None') });
          r.table('tickets').insert({
            user: msg.author.id,
            case: (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4),
            id: channel.id
          }).run();
          channel.createMessage({
            embed: {
              title: 'ID: #' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4),
              description: 'Message: ' + (args.length > 0 ? args.join(' ') : 'None')
            }
          }).then(ticket => {
            let id = ticket.channel.name.split("-").slice(-1)[0];
            r.table('chatlogs').get(ticket.channel.id).run((err, callback) => {
              if (!callback) {
                require('crypto').randomBytes(48, (err, buffer) => {
                  r.table('chatlogs').insert({
                    id: ticket.channel.id,
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
          }).catch((err) => {
            bot.error(err.stack);
            msg.channel.createMessage(':x: | An error has occurred!');
          });
        });
      });
    });
  }
}