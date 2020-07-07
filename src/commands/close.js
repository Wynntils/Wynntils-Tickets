module.exports = {
  info: {
    name: 'Close',
    desc: 'Close a ticket',
    help: 'close',
    uses: [
      'close',
      'end'
    ]
  },
  execute: (bot, r, msg, args) => {
    if (msg.channel.parentID !== bot.config.category) return;
    r.table('tickets').get(msg.channel.id).run((err, callback) => {
      if (!callback) return;
      if ((msg.author.id === callback.user || msg.member.roles.find(r => r.id === '521318643024527383'))) {
        r.table('tickets').get(callback.id).update({closed: true}).run();
        msg.channel.delete();
        msg.channel.guild.fetchAllMembers();
        var ticketOwner = msg.channel.guild.members.find(m => m.user.id === callback.user);
        if(typeof ticketOwner == "undefined") { // If the user has left the server
          return;
        }
        ticketOwner.user.getDMChannel().then((channel) => {
          r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            var ticketURL = bot.config.baseurl + '/t/' + callback.secret;
            let modChannel = msg.channel.guild.channels.find(channel => channel.id === '448164725990359040');
            let name = callback.name;
            if (name !== undefined) {
              embed = {
                embed: {
                  color: 13710902,
                  description: `<@${msg.author.id}> has closed [#ticket-${callback.case}](${ticketURL})`,
                  fields: [
                    {
                      name: 'Name',
                      value: name,
                      inline: true
                    },
                    {
                      name: 'Reason',
                      value: (args.length > 0 ? args.join(' ') : 'None'),
                      inline: true
                    }
                  ]
                }
              };
            } else {
              embed = {embed: {
                  color: 13710902,
                  description: `<@${msg.author.id}> has closed [#ticket-${callback.case}](${ticketURL})`,
                  fields: [
                    {
                      name: 'Reason',
                      value: (args.length > 0 ? args.join(' ') : 'None'),
                      inline: true
                    }
                  ]
              }};
            }
            modChannel.createMessage(embed).catch((err) => {
              bot.error(err.stack);
              msg.channel.createMessage(':x: | An error has occurred!');
            });
            channel.createMessage(embed).catch((err) => {
              bot.error(err.stack);
              msg.channel.createMessage(':x: | An error has occurred!');
            });
          });
        });
      }
    });
  }
}
