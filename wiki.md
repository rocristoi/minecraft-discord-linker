# DisLink AIO Plugin Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
   - [Setting Up MySQL](#setting-up-mysql)
   - [Bot Configuration](#bot-configuration)
   - [Plugin Configuration](#plugin-configuration)
4. [Features](#features)
5. [Usage](#usage)
   - [Linking Accounts](#linking-accounts)
   - [Commands](#commands)
6. [Permissions](#permissions)
7. [Troubleshooting](#troubleshooting)
8. [Conclusion](#conclusion)

## Introduction
DisLink is a powerful Minecraft plugin that bridges the gap between your Minecraft server and Discord community. By allowing players to link their in-game Minecraft usernames with their Discord profiles, DisLink enhances server management, communication, and community engagement.

## Installation
1. **Download the Plugin**: Obtain the latest version of the DisLink plugin JAR file.
2. **Place in Plugins Folder**: Copy the JAR file into the `plugins` folder of your Minecraft server.
3. **Start the Server**: Launch your Minecraft server to enable the plugin.

## Configuration

### Setting Up MySQL
1. **Create a Database**: Set up a MySQL database using your preferred database management tool. For developing, I've userd `MariaDB`
2. **User Permissions**: Ensure the database user has permissions to read and write to the database.
3. **Configure Database Connection**: Update the `config.yml` file in the DisLink plugin folder with your database details.

### Bot Configuration
1. **Create a Discord Bot**: Set up a Discord bot through the [Discord Developer Portal](https://discord.com/developers/applications).
2. **Get the Bot Token**: Copy the bot token and paste it into the plugin configuration file.
3. **Set Permissions**: Ensure the bot has the necessary permissions to send messages and manage users in your Discord server.

### Plugin Configuration
- Modify the `config.yml` file to adjust settings such as:
  - MySQL connection details
  - Bot token
  - Command prefix
  - Cooldown settings

## Features
- **Account Linking**: Players can link their Minecraft usernames with their Discord accounts through simple commands.
- **MySQL Database Integration**: Scalable integration for managing user mappings.
- **Discord Bot Integration**: Handles commands issued in Discord and manages account synchronization.
- **Detailed Configurations**: Easily customizable settings for enhanced control.
- **Titles and Notifications**: Provides in-game titles and notifications for various events.
- **Cooldown Bypass Permissions**: Permissions for players to bypass cooldowns on commands.

## Configuration Details

This section outlines the configuration options available in the `config.yml` file for the DisLink plugin. Each setting is crucial for ensuring the proper functionality of the plugin.

### Database Configuration

```yaml
database:
  ip:               # IP address of the MySQL server. Use 'localhost' if the database is hosted on the same server.
  port: 3306        # Default MySQL port. Change if necessary.
  name: loginSystem # Name of the database. Please set it up first!
  username: admin   # MySQL username with appropriate permissions for the database.
  password: admin   # MySQL password for the above user.
  first-time: 1     # If set to 1, the plugin will automatically create the necessary tables in your database.
                    # This updates to 0 (off) if the DB was successfully configured.
```
- **first-time**: Set this to 1 to allow the plugin to create the necessary tables *upon first run*. This will automatically change to 0 once the database is successfully configured.

### Server Configuration

```yaml 
server:
  link: 'DisLink'  
```

- link: The name of your server. This will be displayed in the bot's activity as: Watching {link} where {link} represents this setting.

### Discord Configuration

```yaml 
discord:
  token: ""             # Bot token from the Discord Developer Portal.
  client_id: ""        # Client ID of the Discord bot.
  guild_id: ""         # ID of the Discord server (guild) where the bot operates.
  footer: "DisLink"     # Footer text for messages sent by the bot.
  change-nickname: "1"  # 1 for enabled, 0 for disabled (allows the bot to change user nicknames).
  nickname-format: "{disUsername} (@{mcUsername})" # Format for the bot to display nicknames.
```
- **token**: Your Discord bot token obtained from the Discord Developer Portal.
- **client_id**: The client ID associated with your Discord bot.
- **guild_id**: The ID of the Discord server where the bot will function.
- **footer**: Custom footer text for messages sent by the bot.
- **change-nickname**: Set to 1 to enable the bot's ability to change user nicknames in Discord.
- **nickname-format**: Custom format for displaying nicknames, where **{disUsername}** is replaced with the user's Discord username and **{mcUsername}** with their Minecraft username.
## Usage

### Linking Accounts
1. Players run the `/link <username>` command in Minecraft.
2. A unique code is generated for the player to enter in Discord.
3. The plugin verifies the code and links the accounts in the MySQL database.

### Commands
Minecraft Commands
- `/link <username>`: Initiates the account linking process.
- `/unlink`: Unlinks the Minecraft and Discord accounts.
- `/amilinked`: Checks if a player is linked.

Discord Commands
- `/verify <key>`: Links a user if the key is correct.
- `/unlink`: Unlinks the Minecraft and Discord accounts.
## Permissions
- **dislink.cooldown.bypass**: Allows players to bypass command cooldowns.

## Troubleshooting
- Ensure the bot is online and has the required permissions in Discord.
- Verify the MySQL database connection details in the `config.yml`.
- Check the server logs for any error messages related to the plugin.
- [Contact me](https://media.cristoi.ro) if anything goes wrong.


## Conclusion
With DisLink, players stay connected, communication is streamlined, and server management becomes easier than ever. For further assistance, please refer to the community support channels or the plugin's GitHub repository.
