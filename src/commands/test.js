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
		// msg.channel.createMessage(eval(args.join(" ")));
		// msg.channel.createMessage({
		//     embed: {
		//         title: "I'm an embed!", // Title of the embed
		//         description: "Here is some more info, with **awesome** formatting.\nPretty *neat*, huh?",
		//         author: { // Author property
		//             name: msg.author.username,
		//             icon_url: msg.author.avatarURL
		//         },
		//         color: 0xFF00FF, // Color, either in hex (show), or a base-10 integer
		//         fields: [ // Array of field objects
		//             {
		//                 name: "Some extra info.", // Field title
		//                 value: "Some extra value.", // Field
		//                 inline: true // Whether you want multiple fields in same line
		//             },
		//             {
		//                 name: "Some more extra info.",
		//                 value: "[masked links](http://google.com).",
		//                 inline: true
		//             }
		//         ],
		//         footer: { // Footer text
		//             icon_url: bot.avatarURL,
		//             text: "Wynntils Tickets"
		//         }
		//     }
		// });
	}
};
