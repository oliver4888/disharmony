import Message from "../models/discord/message"
import Command, { PermissionLevel } from "../commands/command"
import Config from "../models/internal/config"

async function invoke(params: string[], message: Message)
{
    const config = await new Config("config");
    config.loadDocument()

    if (params[0] in config)
        // convert to a Number if value is number-y
        config[params[0]] = !isNaN(params[1] as any) ? Number(params[1]) : params[1]
    else
        throw "Unknown config key"

    config.save()
    return `Updated value for key ${params[0]}`
}

module.exports = new Command(
    /*name*/            "configure",
    /*description*/     "Update a bot configuration value. Hosting owner only.",
    /*syntax*/          "configure <key> <value>",
    /*permissionLevel*/ PermissionLevel.HostOwner,
    /*invoke*/          invoke
)