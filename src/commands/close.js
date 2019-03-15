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
            channel.createMessage(bot.config.baseurl + '/t/' + callback.secret);
          });
        });
      }
    });
  }
}