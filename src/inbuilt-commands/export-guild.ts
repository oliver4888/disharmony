import { Permissions } from "discord.js"
import { Command, DisharmonyMessage, PermissionLevel } from ".."
import PendingDataPorts from "../models/internal/pending-data-ports"

async function invoke(_: string[], message: DisharmonyMessage)
{
    const pendingList = new PendingDataPorts()
    await pendingList.loadDocument()

    const guildId = message.guild.id
    const memberId = message.member.id

    if (pendingList.allPending.find(x => x.guildId === guildId && x.memberId === memberId))
        return "You already have a pending export for this server!"

    if (!message.guild.hasPermissions(Permissions.FLAGS.ATTACH_FILES!))
        return "Please grant the bot permission to attach files and try again"

    pendingList.allPending.push({
        guildId,
        memberId,
        channelId: message.channelId,
        isImport: false,
    })

    await pendingList.save()
    return "Your export will be generated in the background within a few minutes and will be uploaded to this channel."
}

export default new Command(
    /*syntax*/          "export",
    /*description*/     "Export data from this guild in JSON format",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)