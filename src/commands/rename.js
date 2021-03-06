module.exports = {
    info: {
      name: 'Rename',
      desc: 'Renames a ticket',
      help: 'rename',
      uses: [
        'rename',
        'r'
      ]
    },
    execute: (bot, r, msg, args) => {
    if (msg.channel.parentID !== bot.config.category) return;
        r.table('tickets').get(msg.channel.id).run((err, callback) => {
            let name = (args.join("-") + '-' + msg.channel.name.split("-").slice(-1)[0]).toLowerCase();
            console.log(name);
            msg.channel.edit({ name: name });
            callback.name = args.join(" ");
            // :white_check_mark: This ticket has been renamed to quest-book-crash-0238
            msg.channel.createMessage({
              embed: {
                description: `:white_check_mark: This ticket has been renamed to ${name}`
              }
            });
            r.table('tickets').get(msg.channel.id).update(callback).run();
        });
    }
}