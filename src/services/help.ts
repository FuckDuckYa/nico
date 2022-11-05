import Discord from "discord.js";
const toNewFields = (name, value, inline = false) => ({ name, value, inline });

export default async (
	client: Discord.Client,
	msg: Discord.Message,
	prefix: string
) => {
	/* prettier-ignore */
	let commands = [...client.manager.commands.values()];

	const args = ap(msg.content, true);
	if (!args[1]) {
		let categorys: Record<string, string> = {};
		for (let c of commands) {
			if (c?.disabled || c?.hidden) continue;
			if ("category" in c) {
				if (c.category! in categorys) {
					categorys[c.category!] += `, \`${prefix}${c.command}\``;
					continue;
				}
				categorys[c.category!] = "`" + prefix + c.command + "`";
			}
		}

		const newEmbed = new Discord.EmbedBuilder()
			.setColor("#CFF2FF")
			.setTitle("nico")
			.setDescription(
				i18n.parse(msg.lang, "basic.help.description", prefix, prefix)
			);
		for (let [key, value] of Object.entries(categorys)) {
			newEmbed.addFields(
				toNewFields(
					`**${
						i18n.parse(msg.lang, "basic.help.categorys")[key] ?? key
					}**`,
					value
				)
			);
		}

		return msg.channel.send({ embeds: [newEmbed] });
	} else {
		const command = commands.find(
			a => (a.alias ?? []).includes(args[1]) || a.command === args[1]
		);
		if (!command)
			return msg.channel.send({
				embeds: [
					new Discord.EmbedBuilder()
						.setColor("#B33A3A")
						.setDescription(
							i18n.parse(msg.lang, "basic.help.notfound")
						)
				]
			});
		/*
        args[0] = 'help'
        var path = `../../commands/${args[0]}.js`;
        //
        try{
            require(`../commands/${args[0]}`)
        }catch (err){
            exists = 0
        }
        ///
        fs.access(path, (err) => {
            if (!err) {
              exists = 1
              return;
            }
        })*/
		let [desc, usage] = [
			i18n.parse(
				msg.lang ?? "en",
				`-${command.category?.toLowerCase()}.${command.command.toLowerCase()}.description`
			),
			i18n.parse(
				msg.lang ?? "en",
				`-${command.category?.toLowerCase()}.${command.command.toLowerCase()}.usage`
			)
		].map(v =>
			v.endsWith(".usage") || v.endsWith(".description") ? undefined : v
		);
		usage = (
			usage ??
			(command.usage || `${prefix}${command.command}`)
		).replaceAll("%p", prefix);
		desc = (
			desc ??
			(command.desc || `${prefix}${command.command}`)
		).replaceAll("%p", prefix);

		const newEmbed = new Discord.EmbedBuilder()
			.setColor(i18n.globe.color)
			.setTitle(
				`\`${prefix}${command.command}\`` +
					(command.alias ?? []).reduce(
						(p, v) => p + ` **/** \`${prefix}${v}\``,
						""
					)
			)
			.setDescription(`${desc}`)
			.addFields({ name: "Usage", value: `${usage}`, inline: true });
		msg.channel.send({ embeds: [newEmbed] });
	}
};
