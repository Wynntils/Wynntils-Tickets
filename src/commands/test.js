module.exports = {
	info: {
		name: "Test",
		desc: "Command to test new features",
		help: "test [args]",
		uses: ["test"]
	},
	execute: (bot, r, msg, args) => {
		if (msg.author.id !== "188557595382906880") return;
		const clean = text => {
			if (typeof text === "string")
				return text
					.replace(/`/g, "`" + String.fromCharCode(8203))
					.replace(/@/g, "@" + String.fromCharCode(8203));
			else return text;
		};
		try {
			const code = args.join(" ");
			let evaled = eval(code);

			if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

			msg.channel
				.createMessage(clean(evaled), { code: "xl" })
				.catch(function(err) {
					msg.channel.createMessage(
						`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``
					);
				});
		} catch (err) {
			msg.channel.createMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
};
