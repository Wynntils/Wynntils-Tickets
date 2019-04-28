module.exports = (bot, r) => {
    bot.on('messageUpdate', msg => {
        if (msg.author.bot) return;
        if (msg.channel.parentID !== bot.config.category) return;
        // console.log('Update', msg.id);
        r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            if (callback) {
                var index = callback.logs.findIndex(x => x.id === msg.id);
                // console.log(index);
                // console.log(callback.logs[index]);
                callback.logs[index].content = msg.content;
                // console.log(callback.logs[index]);
                r.table('chatlogs').get(msg.channel.id).update(callback).run();
            }
        });
    });
}

