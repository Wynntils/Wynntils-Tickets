export const info = {
  name: 'Add',
  desc: 'Adds a user to the ticket',
  help: 'add [user(s)]',
  uses: [
    'add'
  ]
};
export function execute(bot, r, msg, args) {
  if (msg.channel.parentID !== bot.config.category)
    return;
  if (msg.member.permission.has('manageMessages')) {
    if (msg.mentions.length >= 1) {
      let addedUsers = [];
      for (var user in msg.mentions) {
        msg.channel.editPermission(user.id, 3072, 0, "member", `Added ${user.username} to #${msg.channel.name}`);
        addedUsers.push(`<@${user.id}>`);
      }
      if (addedUsers.length > 0) {
        msg.channel.createMessage(`${msg.author.username} added ${addedUsers.join(', ')} to this ticket.`);
      }
      else {
        msg.channel.createMessage(`Could not find user - ${args}.`);
      }
    }
    else {
      msg.createMessage('Please provide a user to be added to this ticket.');
    }
  }
  else {
    msg.createMessage("You're not allowed to add members to this ticket.");
  }
}
