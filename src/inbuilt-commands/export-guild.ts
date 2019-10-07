import { BotMessage, Command, PermissionLevel } from ".."

async function invoke(_: string[], message: BotMessage)
{
    return `\`\`\`JavaScript\n ${message.guild.getExportJson()}\`\`\``
}

export default new Command(
    /*syntax*/          "export",
    /*description*/     "Export data from this guild in JSON format",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)