# Discord Minecraft Linker Bot

This repository contains a Discord bot and a plugin that allow users to link their Minecraft accounts with Discord by verifying a secret key. The plugin provides a secure way to establish the link, and the bot handles the verification process.

## Installation

1. Download the pre-compiled plugin from the [Releases](https://github.com/cristilmao/minecraft-discord-linker/releases) section of this repository.

1B. To ***compile*** the plugin from the Java source code, navigate to the `Java Plugin` folder and follow the build instructions provided.

2. In the `index.js` file, make the following configuration changes:
    - Replace `YOUR_DISCORD_BOT_TOKEN` with your Discord bot token.
    - Replace `YOUR_CLIENT_ID` with your bot's client ID.
    - Replace `YOUR_GUILD_ID` with your Discord guild (server) ID.

2. Set up a MySQL database, and configure the database connection details in the `index.js` file.

## Requirements

- Basic knowledge of Node.js, Discord.js, and npm.
- Basic understanding of how Java plugins for Minecraft work.
- A MySQL database for storing verification data.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## TODO

- Improve security by avoiding HTTP POST requests.
- Enhance MySQL security to prevent SQL injections.

We welcome contributions from the community to help improve the project.

Feel free to [open issues](https://github.com/cristilmao/minecraft-discord-linker/issues) for any problems you encounter or ideas for enhancements.
