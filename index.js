
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const https = require('https');
const fs = require('fs');
const fsp = require('fs').promises;
require('dotenv').config();

/*
In the same folder, create a .env file with the following content:


DISCORD_TOKEN='token from discord.com/developers'
CLIENT_ID=bot id
GUILD_ID=server id
DB_HOST=your database host
DB_USER=your database user
DB_PASSWORD=your database password
DB_NAME=your database name
API_KEY=your own api key


⚠️ These settings need to be the same in main.java in order to make the plugin work. 
🔒 It is usually better & safer to store confidential data in a .env file.

*/
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const API_KEY = process.env.API_KEY;

const options = {
  key: fs.readFileSync('/'), // privatekey file
  cert: fs.readFileSync('/'), // fullchain file
};

const rest = new REST({ version: '10' }).setToken(TOKEN);



const commands = [
    {
        name: 'verify',
        description: 'Links your Minecraft Account To Discord',
        type: 1, // ApplicationCommandType.SLASH,
        options: [
          {
            name: 'key',
            description: 'Your Secret Key',
            type: 3, // ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: 'unlink',
        description: 'Unlinks Your Account From Minecraft',
        type: 1, // ApplicationCommandType.SLASH,
      },
];

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const app = express();

app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  reconnect: true,
});


db.connect((err) => {
  if (err) throw err;
  console.log('Connected to Login MySQL database.');
});

// Express server routes
app.post('/verification', authenticateRequest, (req, res) => {
    const { playerName, playerUUID, discordUsername, secretKey } = req.body;

  // Store the verification data, or handle however you need
  // For example, insert into a 'verification' table
  const insertQuery = 'INSERT INTO verification (playerName, playerUUID, discordUsername, secretKey) VALUES (?, ?, ?, ?)';

  db.query(insertQuery, [playerName, playerUUID, discordUsername, secretKey], (err, results) => {
    if (err) {
      console.error('Failed to insert verification data:', err);
      res.status(500).json({ message: 'Failed to store verification data.' });
    } else {
      res.status(200).json({ message: 'Verification data stored successfully.' });
    }
  });
});


// Start the Express server over HTTPS
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    const interactionUser = await interaction.guild.members.fetch(interaction.user.id)
  
    const nickName = interactionUser.nickname
    const userName = interactionUser.user.username
    const userId = interactionUser.id
  
    const { commandName, options } = interaction;
    const member = interaction.member;
  
    if (commandName === 'verify') {
      const secretKey = options.getString('key');
      const query = 'SELECT * FROM verification WHERE secretKey = ? LIMIT 1';
    
      db.query(query, [secretKey], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          interaction.reply({ content: 'An error occurred while verifying your account.' });
          return;
        }
    
        if (results.length === 1) {
          const playerName = results[0].playerName;
          const expectedDiscordUsername = results[0].discordUsername;
    
          // Check if the account is already linked
          checkIfExists(userName, (isLinked) => {
            if (isLinked) {
              const alreadyLinked = {
                color: 0xFF0000,
                title: 'Account Is Already Linked!',
                description: `Hello ${playerName}, your account is already linked to ${userName}. You may run **/unlink** to unlink yourself.`,
                thumbnail: {
                  url: `https://mc-heads.net/body/${playerName}.png`,
                },
                timestamp: new Date(),
                footer: {
                  text: 'github/cristilmao',
                },
              };
              




              interaction.reply({ embeds: [alreadyLinked] });
              return;
            }
            const interactionID = interaction.user.id;
            const updateQuery = `UPDATE verification SET isVerified = TRUE WHERE secretKey = ?`;
            db.query(updateQuery, [secretKey], (updateErr) => {
              if (updateErr) {
                console.error('Database update error:', updateErr);
                interaction.reply({ content: 'An error occurred while linking your account.' });
                return;
              } else if (userName !== expectedDiscordUsername) {
                interaction.reply(`Your Discord Username is not valid!`);
                return;
              }
    
              const completedEmbed = {
                color: 0x0099FF,
                title: 'Account Linked!',
                description: `Account Linked Successfully!\n ${userName} -> ${playerName}`,
                thumbnail: {
                  url: `https://mc-heads.net/body/${playerName}.png`,
                },
                timestamp: new Date(),
                footer: {
                  text: 'github/cristilmao',
                },
              };
    
              interaction.reply({ embeds: [completedEmbed] });
              interaction.guild.members.fetch(interaction.user.id)
  .then(member => {
    member.setNickname(`${userName} (@${playerName})`);
  })
  .catch(error => {
    console.error(error);
  });

    
              // Delete rows from 'verification' table and insert into 'user_mapping' table
              const deleteQuery = 'DELETE FROM verification WHERE secretKey = ?';
              db.query(deleteQuery, [secretKey], (deleteErr) => {
                if (deleteErr) {
                  console.error('Database delete error:', deleteErr);
                } else {
                  const data = {
                    discord_username: userName,
                    minecraft_username: playerName,
                    discord_id: interactionID,
                  };
                  const insertQuery = 'INSERT INTO user_mapping SET ?';
                  db.query(insertQuery, data, (insertErr) => {
                    if (insertErr) {
                      console.error('User Data insert error:', insertErr);
                    } else {
                      console.log('User Data inserted into the table.');
                    }
                  });
                }
              });
            });
          });
        } else {
          interaction.reply({ content: 'Invalid secret key or your account is already linked.' });
        }
      });
    }
    
    function checkIfExists(userName, callback) {
      const discordUsernameToCheck = userName;
      const sql2 = 'SELECT * FROM user_mapping WHERE discord_username = ?';
      db.query(sql2, discordUsernameToCheck, (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          callback(false); // Error occurred, assume not linked
        } else {
          if (results.length > 0) {
            callback(true); // Discord username is already linked
          } else {
            callback(false); // Discord username is not linked
          }
        }
      });
    }
  
    if (commandName === 'unlink') {
      const selectQuery = 'SELECT * FROM user_mapping WHERE discord_username = ?';
      const deleteQuery = 'DELETE FROM user_mapping WHERE discord_username = ?';
      
      db.query(selectQuery, userName, (err, results) => {
        if (err) {
          console.error('Database query error:', err);
  
          interaction.reply({ embeds: [erorrEmbed] });
  
        } else if (results.length > 0) {
          // The username exists in the table, delete it
          db.query(deleteQuery, userName, (deleteErr) => {
            if (deleteErr) {
              console.error('Database delete error:', deleteErr);
              interaction.reply({ embeds: [erorrEmbed] });
  
            } else {
              // Deletion successful
              console.log('Username deleted:', userName);
  
              const deletedEmbed = {
                color: 0x0008000,
                title: 'Bye',
                description: 'Your Account was Successfully Unlinked',
                timestamp: new Date(),
                footer: {
                  text: 'See you soon! | github/cristilmao',
                },
              };
  
              interaction.reply({ embeds: [deletedEmbed] });
  
            }
          });
        } else {
          const doesnExist = {
            color: 0xFF0000,
            title: 'Account Not linked',
            description: `My database shows that you don't have an account linked with us, **yet** 🤨`,
            timestamp: new Date(),
            footer: {
              text: 'github/cristilmao',
            },
          };
          interaction.reply({ embeds: [doesnExist] });
          // The username does not exist in the table
        }
      });
    }
  });

client.login(TOKEN);

// FUNCTIONS

async function checkIfUserExists(userId) {
    return new Promise((resolve) => {
        const query = 'SELECT * FROM user_mapping WHERE discord_id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                resolve(false); // Assume not found in case of an error
            } else {
                // Resolve with the query results
                resolve(results.length > 0);

            }
        });
    });
}

function getUsernameFromId(userId) {
  return new Promise((resolve, reject) => {
      const selectQuery = 'SELECT discord_username FROM user_mapping WHERE discord_id = ?';
      db.query(selectQuery, [userId], (err, results) => {
          if (err) {
              console.error('Database query error:', err);
              reject(err); // Reject the promise with an error
          } else {
              if (results.length > 0) {
                  const discordUsername = results[0].discord_username;
                  resolve(discordUsername); // Resolve the promise with the username
              } else {
                  resolve(null); // Resolve with null if user is not found
              }
          }
      });
  });
}


async function getMcUserFromId(userId) {
  return new Promise((resolve, reject) => {
      const selectQuery = 'SELECT minecraft_username FROM user_mapping WHERE discord_id = ?';
      db.query(selectQuery, [userId], (err, results) => {
          if (err) {
              console.error('Database query error:', err);
              reject(err);
          } else {
              if (results.length > 0) {
                  const minecraftUsername = results[0].minecraft_username;
                  resolve(minecraftUsername);
              } else {
                  resolve(null); // Resolve with null if user is not found
              }
          }
      });
  });
}



function authenticateRequest(req, res, next) {
  const providedApiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (providedApiKey === API_KEY) {
    next(); // Continue to the next middleware
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}


// Embed function
function newEmbed(title, color, description, image = 0) {
  if(image == 0) {
    return {
      color: color,
      title: title,
      description: description,
      timestamp: new Date(),
      footer: {
        text: 'github/cristilmao',
      },
    }
  } else {
  return {
    color: color,
    title: title,
    description: description,
    thumbnail: {
      url: image,
    },
    timestamp: new Date(),
    footer: {
      text: 'github/cristilmao',
    },
  };
}
}

      });
    });
  }
  
