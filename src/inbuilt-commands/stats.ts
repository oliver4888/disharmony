import Message from "../models/discord/message"
import { IClient } from "../client"
import Command, { PermissionLevel } from "../commands/command"

function invoke(_: string[], __: Message, client: IClient)
{
    return Promise.resolve(
        `
        **Server count:** ${client.stats.guildCount}
        **Cached users:** ${client.stats.userCount}
        **Uptime:** ${client.stats.uptimeStr}
        `
    )
}

module.exports = new Command(
    /*name*/            "stats",
    /*description*/     "Returns some stats about the bot",
    /*syntax*/          "stats",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke
)