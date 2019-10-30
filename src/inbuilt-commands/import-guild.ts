import { Command, DisharmonyMessage, PermissionLevel } from ".."
import PendingDataPorts from "../models/internal/pending-data-ports"

async function invoke(_: string[], message: DisharmonyMessage)
{
    if (message.djs.attachments.size === 0)
        return "Please issue the command again with your JSON data file attached."

    const pendingList = new PendingDataPorts()
    await pendingList.loadDocument()

    const guildId = message.guild.id
    const memberId = message.member.id

    if (pendingList.allPending.find(x => x.guildId === guildId))
        return "You already have a pending import or export for this server, please wait for it to complete before trying again."

    pendingList.allPending.push({
        guildId,
        memberId,
        channelId: message.channelId,
        isImport: true,
        url: message.djs.attachments.first().url,
    })

    await pendingList.save()
    return "Your import will be processed in the background within a few minutes and you will receive a confirmation message in this channel."
}

export default new Command(
    /*syntax*/          "import",
    /*description*/     "Import data for this guild from JSON",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)