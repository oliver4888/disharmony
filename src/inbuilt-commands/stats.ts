import Command, { PermissionLevel } from "../commands/command"
import { Client } from "../core/client"
import BotMessage from "../models/discord/message"

function invoke(_: string[], __: BotMessage, client: Client)
{
    return Promise.resolve(
        `
        **Server count:** ${client.stats.guildCount}
        **Cached users:** ${client.stats.userCount}
        **Uptime:** ${client.stats.uptimeStr}
        `,
    )
}

export default new Command(
    /*syntax*/          "stats",
    /*description*/     "Returns some stats about the bot",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke,
)