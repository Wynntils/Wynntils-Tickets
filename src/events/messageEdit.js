module.exports = (bot, r) => {
    bot.on('messageUpdate', msg => {
        if (msg.author.bot) return;
        if (msg.channel.parentID !== bot.config.category) return;
        console.log('Update', msg.id);
        r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            if (callback) {
                var index = callback.logs.findIndex(x => x.id === msg.id);
                console.log(index);
                console.log(callback.logs[index]);
                callback.logs[index].content = msg.content;
                console.log(callback.logs[index]);
                r.table('chatlogs').get(msg.channel.id).update(callback).run();
            }
        });
    });

    bot.on('messageDelete', msg => {
        if (msg.author.bot) return;
        if (msg.channel.parentID !== bot.config.category) return;
        console.log('Delete', msg.id);
        r.table('chatlogs').get(msg.channel.id).run((err, callback) => {
            if (callback) {
                var index = callback.logs.findIndex(x => x.id === msg.id);
                console.log(index);
                console.log(callback.logs[index]);
                delete callback.logs[index];
                var tmpArray = [];
                for(var i in callback.logs) {
                    if(callback.logs[i]) {
                        tmpArray.push(callback.logs[i]);
                    }
                }
                callback.logs = tmpArray;
                console.log(callback.logs[index]);
                r.table('chatlogs').get(msg.channel.id).update(callback).run();
            }
        });
    });
}

