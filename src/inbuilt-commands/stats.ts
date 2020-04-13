import Command, { PermissionLevel } from "../commands/command"
import { Client } from "../core/client"
import DisharmonyMessage from "../models/discord/disharmony-message"
import { RichEmbed } from "discord.js"

async function invoke(_: string[], message: DisharmonyMessage, client: Client): Promise<void> {
    const embed = new RichEmbed()
        .setTitle(`__${client.config.serviceName} stats__`)
        .addField("Server Count", client.stats.guildCount, false)
        .addField("Cached users", client.stats.userCount, false)
        .addField("Uptime", client.stats.uptimeStr, false)

    await message.reply(embed)
}

export default new Command(
    /*syntax*/          "stats",
    /*description*/     "Returns some stats about the bot",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke,
)