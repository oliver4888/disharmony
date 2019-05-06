import Command, { PermissionLevel } from "../commands/command"
import BotMessage from "../models/discord/message"
import Config from "../models/internal/config"

async function invoke(params: string[], message: BotMessage)
{
    const config = await new Config("config");
    await config.loadDocument()

    if (params[0] in config)
        // convert to a Number if value is number-y
        config[params[0]] = !isNaN(params[1] as any) ? Number(params[1]) : params[1]
    else
        throw new Error("Unknown config key")

    await config.save()
    return `Updated value for key ${params[0]}`
}

export default new Command(
    /*name*/            "configure",
    /*description*/     "Update a bot configuration value. Hosting owner only.",
    /*syntax*/          "configure <key> <value>",
    /*permissionLevel*/ PermissionLevel.HostOwner,
    /*invoke*/          invoke,
)