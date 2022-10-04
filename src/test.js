const { REST, SlashCommandBuilder, Routes } = require('discord.js');

const commands = [
	new SlashCommandBuilder()
		.setName('gif')
		.setDescription('Replies with gif from user input!')
		.addStringOption(option =>
			option.setName('term')
				.setDescription('What to search for')
				.setRequired(true)),
	
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken("OTQzMzU4NTE4MjQzNzYyMjA2.GZxHbN.uGPJlJU3PunOrv8Sodj0wsVJ_6XG_1krRNT9EU");

rest.put(Routes.applicationGuildCommands("943358518243762206", "881103803645063168"), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);