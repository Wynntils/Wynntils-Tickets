module.exports = (bot, r) => {
    bot.on('messageDelete', msg => {
        if (msg.author.bot) return;
        if (msg.channel.parentID !== bot.config.category) return;
        // console.log('Delete', msg.id);
        r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            if (callback) {
                var deleteme = false;
                var index = callback.logs.findIndex(x => x.id === msg.id);
                if (deleteme) {
                    delete callback.logs[index];
                    var tmpArray = [];
                    for (var i in callback.logs) {
                        if (callback.logs[i]) {
                            tmpArray.push(callback.logs[i]);
                        }
                    }
                    callback.logs = tmpArray;
                    r.table('chatlogs').get(msg.channel.id).update(callback).run();
                } else {
                    callback.logs[index].deleted = true;
                    r.table('chatlogs').get(msg.channel.id).update(callback).run();
                }
            }
        });
    });
}