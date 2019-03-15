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
    if (!msg.channel.name.startsWith('ticket-')) return;
    r.table('tickets').getAll(msg.channel.name.replace('ticket-', ''), { index: 'case' }).run((err, callback) => {
      if (!callback) return;
      console.log(callback);
      callback = callback[0];
      console.log(callback);
      if (msg.member.permission.has('manageMessages') || (msg.author.id === callback.user)) {
        r.table('tickets').get(callback.id).update({closed: true}).run();
        msg.channel.delete();
        msg.channel.guild.fetchAllMembers();
        msg.channel.guild.members.find(m => m.user.id === callback.user).user.getDMChannel().then((channel) => {
          r.table('chatlogs').get(msg.channel.name.replace('ticket-', '')).run((err, callback) => {
            channel.createMessage(bot.config.baseurl + '/?secret=' + callback.secret);
          });
        });
      }
    });
  }
}