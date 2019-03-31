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
      // for (call in callback) {
      //   // console.log(callback[call]);
      //   if (err) return bot.error(err.stack);
      //   if (callback[call] && (callback[call].length !== 0)) {
      //     if (!callback[call].closed) {
      //       msg.channel.createMessage(':x: | You already have an open ticket (<#' + callback[call].id + '>)');
      //       return;
      //     }
      //   }
      // }
      r.table('tickets').orderBy({index: r.desc('case')}).run((err, callback) => {
        if (err) return bot.error(err.stack);
        msg.channel.guild.createChannel('ticket-' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4), 0, 'New ticket', bot.config.category).then(channel => {
          channel.editPermission(msg.channel.guild.id, 0, 3072, "role", "New Ticket");
          let Support = msg.channel.guild.roles.find(role => role.name === "Support Team");
          channel.editPermission(Support.id, 3072, 0, "role", "New Ticket");
          channel.editPermission(msg.author.id, 3072, 0, "member", "New Ticket");
          // channel.editPosition(0);
          r.table('tickets').insert({
            user: msg.author.id,
            case: (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4),
            id: channel.id
          }).run();
          // console.log(msg.author);
          //448164725990359040
          msg.channel.createMessage({
            embed: {
              description: `:white_check_mark: The channel <#${channel.id}> has been created for you.`
            }
          });
          let modChannel = msg.channel.guild.channels.find(channel => channel.id === '448164725990359040');
          modChannel.createMessage({
            embed: {
              color: 7531934,
              description: `<@${msg.author.id}> has opened a new ticket <#${channel.id}>`,
              fields: [
                {
                  name: 'Subject',
                  value: (args.length > 0 ? args.join(' ') : 'None')
                }
              ]
            }
          });
          channel.createMessage({
            embed: {
              color: 7531934,
              title: 'ID: #' + (new Array(4).join('0') + (parseInt(callback[0].case) + 1)).substr(-4),
              description:
                `Hello, <@${msg.author.id}>.\n\n` +
                'Thank you for reaching out to us!\n\n' +
                'If you are requesting for support, please describe what you are unsure of and, if possible, how we can assist you.\n\n' +
                'If you are reporting a bug/glitch, please describe the issue and upload any relevant file (screenshots, videos, execution logs, etc.) that may allow us to know exactly what the issue is.\n\n' +
                'If you are reporting a crash, please describe what you were doing that had triggered the crash and upload the text file containing the crash report. This can be found in the crash-reports subfolder of the folder that contains all other files relating to Minecraft. Most people have their crash-reports subfolder in their .minecraft folder.\n\n' +
                'Please note that we may or may not respond depending on the subject of the ticket and the information you have provided.\n\n' +
                '-Wynntils Support',
              fields: [
                {
                  name: 'Subject',
                  value: (args.length > 0 ? args.join(' ') : 'None')
                }
              ]
            }
          }).then(ticket => {
            channel.createMessage(`<@${msg.author.id}> Please read the above message before reporting your issue or asking your question below.`);
            let id = ticket.channel.name.split("-").slice(-1)[0];
            ticket.channel.edit({ topic: 'Message: ' + (args.length > 0 ? args.join(' ') : 'None') });
            r.table('chatlogs').get(ticket.channel.id).run((err, callback) => {
              if (!callback) {
                require('crypto').randomBytes(48, (err, buffer) => {
                  r.table('chatlogs').insert({
                    id: ticket.channel.id,
                    secret: buffer.toString('hex'),
                    case: id,
                    logs: [
                      {
                        id: msg.id,
                        user: msg.author.username + '#' + msg.author.discriminator,
                        content: msg.content
                      }
                    ]
                  }).run();
                });
              } else {
                callback.logs.push({
                  id: msg.id,
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
