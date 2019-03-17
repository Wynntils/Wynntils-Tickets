module.exports = {
    info: {
      name: 'Link',
      desc: 'Create a link to view the ticket',
      help: 'link',
      uses: [
        'link'
      ]
    },
    execute: (bot, r, msg, args) => {
      if (msg.channel.parentID !== bot.config.category) return;
      r.table('tickets').get(msg.channel.id).run((err, callback) => {
        if (!callback) return;
        if (msg.member.permission.has('manageMessages') || (msg.author.id === callback.user)) {
            r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
                var ticketURL = bot.config.baseurl + '/t/' + callback.secret;
                msg.channel.createMessage({ embed: { description: `:arrow_right: View your ticket [here](${ticketURL})` } });
            });
        }
      });
    }
  }