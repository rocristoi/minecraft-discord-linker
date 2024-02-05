// Change this to your package name
package **.******;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import okhttp3.*;

import java.sql.*;

// Change with the name of your plugin
public final class LoginSystem extends JavaPlugin {

    private final Map<UUID, String> verificationCodes = new HashMap<>();
    private OkHttpClient httpClient;
    /*
      Change this, where
      IP: IP of your database for storing user validation status
      PORT: PORT of your db, usually 3306
      DATABASE_NAME: Name of your database
      USER: Username with permissions on database
      PASS: Password of the user
    */
    private static final String DB_URL = "jdbc:mysql://IP:PORT/DATABASE_NAME";
    private static final String DB_USER = "USER";
    private static final String DB_PASSWORD = "PASS";

  // Function to check if the user is already linked.
    private boolean isUserLinked(String playerUUID) {
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String query = "SELECT * FROM user_mapping WHERE minecraft_username = ?";
            try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
                preparedStatement.setString(1, playerUUID);
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    return resultSet.next(); // Return true if the user exists, false otherwise
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void onEnable() {
        getLogger().info("----------------------------------------------");
        getLogger().info("     +******************+");
        getLogger().info("     |   Astrex Login   |");
        getLogger().info("     |------------------|");
        getLogger().info("     |    By Cristoi    |");
        getLogger().info("     +*******************");
        getLogger().info("----------------------------------------------");

        httpClient = new OkHttpClient();
        this.getCommand("link").setExecutor(this);
        this.getCommand("unlink").setExecutor(this);
        this.getCommand("amilinked").setExecutor(this);
        this.getCommand("webaccme").setExecutor(this);

    }
    private Map<UUID, Long> linkCooldowns = new HashMap<>();
    private static final long COOLDOWN_TIME_SECONDS = 120; // Set your cooldown time in seconds
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players.");
            return true;
        }


        Player player = (Player) sender;
        UUID playerUUID = player.getUniqueId();
        // /link <user> method
        if (label.equalsIgnoreCase("link")) {
            if (args.length == 1) {
                if (isOnCooldown(playerUUID)) {
                    player.sendMessage("§k|§r §8<> §7Command is on §bcooldown. §7Please wait before using it again.");
                    return true;
                }
                if (isUserLinked(player.getName())) {
                    player.sendMessage("§k|§r §8<> §7You are already verified. No need to run the verification process again.");
                    return true;
                }

                String secretKey = generateSecretKey();
                verificationCodes.put(player.getUniqueId(), secretKey);
                player.sendMessage("§k|§r §8<> §7This is your secret key: §b" + secretKey + "\n§r§k|§r §8<> §7Run /verify §b" + secretKey + " §7on discord to verify.");

                // Set the cooldown timestamp
                linkCooldowns.put(playerUUID, System.currentTimeMillis());

                sendVerificationCode(player, args[0], secretKey);
            } else {
                player.sendMessage("§k|§r §8<> §7Usage: §b/link <DiscordUsername>");
            }
            return true;
        } else if (label.equalsIgnoreCase("unlink")) {
          // This shhould be updated, check if a newer version exists!
            player.sendMessage("§k|§r §8<> §7Your account can be unlinked by running §b/unlink §7on our discord server.");
            player.sendMessage("§b§lINFO §7§l>> §9discord.astrex.pro");
            return true;
        } else if (label.equalsIgnoreCase("amilinked")) {
          // Check if player is linked
            if (isUserLinked(player.getName())) {
                player.sendMessage("§k|§r §8<> §7You are linked. §bEnjoy the features!");
                return true;
            }
            player.sendMessage("§k|§r §8<> §7Your account is not linked. §bLink it now §7by running §b/link <discord username>");
            return true;
        } 
        return false;
    }

    private boolean isOnCooldown(UUID playerUUID) {
        if (linkCooldowns.containsKey(playerUUID)) {
            long lastUsage = linkCooldowns.get(playerUUID);
            long currentTime = System.currentTimeMillis();
            long cooldownInMillis = COOLDOWN_TIME_SECONDS * 1000;

            return currentTime - lastUsage < cooldownInMillis;
        }
        return false;
    }

// Generate secret key
    private String generateSecretKey() {
        return UUID.randomUUID().toString().split("-")[0];
    }

    private void sendVerificationCode(Player player, String discordUsername, String secretKey) {
        MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
        String json = "{\"playerUUID\": \"" + player.getUniqueId().toString() +
                "\", \"playerName\": \"" + player.getName() +
                "\", \"discordUsername\": \"" + discordUsername +
                "\", \"secretKey\": \"" + secretKey + "\"}";

        RequestBody body = RequestBody.create(json, MEDIA_TYPE_JSON);
        Request request = new Request.Builder()
                .url("https://panel.astrex.pro:3000/verification") // Use HTTPS
                .post(body)
                .addHeader("x-api-key", "**************************") // Replace with your actual API key from the discord bot
                .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                getServer().getScheduler().runTask(AstrexLogin.this, () -> player.sendMessage("An error occurred while sending the verification code. Please contact an administrator."));
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    if (response.isSuccessful()) {
                        String responseData = response.body().string();
                        getLogger().info("Server response: " + responseData);
                        // Process the response if needed
                    } else {
                        int statusCode = response.code();
                        String errorResponse = response.body().string();
                        getLogger().info("Server responded with status code: " + statusCode);
                        getLogger().info("Server error response: " + errorResponse);

                        getServer().getScheduler().runTask(AstrexLogin.this, () ->
                                player.sendMessage("There was a problem with your link request. Please contact the server administrators. Status Code: " + statusCode));
                    }
                } finally {
                    response.close();
                }
            }

        });
    }
}
