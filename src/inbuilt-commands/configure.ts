import Message from "../models/discord/message"
import Command, { PermissionLevel } from "../commands/command"
import Config from "../models/internal/config"

async function invoke(params: string[], message: Message)
{
    const config = await new Config().loadRecord(message.guild.id)

    if (!isNaN(params[1] as any))
        config[params[0]] = Number(params[1])
    else
        config[params[0]] = params[1]

    config.save()
}

module.exports = new Command(
    /*name*/            "configure",
    /*description*/     "Update a bot configuration value. Hosting owner only.",
    /*syntax*/          "configure <key> <value>",
    /*permissionLevel*/ PermissionLevel.HostOwner,
    /*invoke*/          invoke
)