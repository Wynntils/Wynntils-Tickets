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
    r.table('tickets').getAll(msg.channel.name.split("-").slice(-1)[0], { index: 'case' }).run((err, callback) => {
      if (!callback) return;
      callback = callback[0];
      if (msg.member.permission.has('manageMessages') || (msg.author.id === callback.user)) {
        r.table('tickets').get(callback.id).update({closed: true}).run();
        msg.channel.delete();
        msg.channel.guild.fetchAllMembers();
        msg.channel.guild.members.find(m => m.user.id === callback.user).user.getDMChannel().then((channel) => {
          r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            channel.createMessage(bot.config.baseurl + '/t/' + callback.secret).catch(function (err) { console.log(err) });
          });
        });
        let modChannel = msg.channel.guild.channels.find(channel => channel.id === '448164725990359040');
        let name = callback.name;
        if (name !== undefined) {
          modChannel.createMessage({
            embed: {
              color: 13710902,
              description: `<@${msg.author.id}> has closed ticket #${callback.case}`,
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
          });
        } else {
          modChannel.createMessage({
            embed: {
              color: 13710902,
              description: `<@${msg.author.id}> has closed ticket #${callback.case}`,
              fields: [
                {
                  name: 'Reason',
                  value: (args.length > 0 ? args.join(' ') : 'None')
                }
              ]
            }
          });
        }
      }
    });
  }
}