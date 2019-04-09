module.exports = {
  info: {
    name: 'Add',
    desc: 'Adds a user to the ticket',
    help: 'add [user(s)]',
    uses: [
      'add'
    ]
  },
  execute: (bot, r, msg, args) => {
    if (msg.channel.parentID !== bot.config.category) return;
    if (msg.member.roles.includes("521318643024527383") && args.length >= 1) {
      var addedUsers = [];
      var byMention = false;
      var user = msg.channel.guild.members.find(member => member.username.toLowerCase().startsWith(args[0].toLowerCase())); //By name
      if (user == undefined) {
        user = msg.channel.guild.members.find(member => member.id === args[0]); //By id
        if (user == undefined && msg.mentions.length >= 1) {
          byMention = true;
          for (var x in msg.mentions) {
            user = msg.mentions[x];
            msg.channel.editPermission(user.id, 3072, 0, "member", `Added ${user.username} to #${msg.channel.name}`);
            addedUsers.push(`<@${user.id}>`);
          }
        } 
      }
      if (user != undefined && !byMention) {
        msg.channel.editPermission(user.id, 3072, 0, "member", `Added ${user.username} to #${msg.channel.name}`);
        addedUsers.push(`<@${user.id}>`);
      }
      if (addedUsers.length > 0) {
        msg.channel.createMessage(`${msg.author.username} added ${addedUsers.join(', ')} to this ticket.`);
      } else {
        msg.channel.createMessage(`Could not find user - ${args}.`);
      }
      
    } else {
      msg.createMessage("You're not allowed to add members to this ticket.");
    }
  }
};
