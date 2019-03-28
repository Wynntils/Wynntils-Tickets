module.exports = {
  info: {
    name: 'Add',
    desc: 'Adds a user to the ticket',
    help: 'add',
    uses: [
      'add'
    ]
  },
  execute: (bot, r, msg, args) => {
    if (msg.channel.parentID !== bot.config.category) return;
    if (msg.member.permission.has('manageMessages')) {
      if (args.length === 1) {
        let user = msg.mentions.members.first();
        if (user === undefined) {
          user = message.guild.members.find('displayName', args[0])
        }
        if (user !== undefined) {
          msg.channel.overwritePermissions(user, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
          });
          msg.channel.createMessage(`${msg.author} added ${user} to this ticket.`)
        } else {
          msg.channel.createMessage(`Could not find user - ${args[0]}.`);
        }
      } else {
        msg.createMessage('Please provide a user to be added to this ticket.')
      }
    } else {
      msg.createMessage("You're not allowed to add members to this ticket.")
    }
  }
}
