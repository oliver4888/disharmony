import { BotMessage, Command, PermissionLevel } from ".."
import PendingExports from "../models/internal/pending-exports"

async function invoke(_: string[], message: BotMessage)
{
    const pendingList = new PendingExports()
    await pendingList.loadDocument()

    if (pendingList.allPending.find(x => x.guildId === message.guild.id && x.memberId === message.member.id))
        return "You already have a pending export for this server!"

    pendingList.allPending.push({
        guildId: message.guild.id,
        memberId: message.member.id,
    })

    await pendingList.save()
    return "Your export will be generated in the background and should be private messaged to you within one hour."
}

export default new Command(
    /*syntax*/          "export",
    /*description*/     "Export data from this guild in JSON format",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)