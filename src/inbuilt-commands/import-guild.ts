import { Command, DisharmonyMessage, PermissionLevel } from ".."
import PendingDataPorts from "../models/internal/pending-data-ports"

async function invoke(_: string[], message: DisharmonyMessage)
{
    if (message.djs.attachments.size === 0)
        return "Please issue the command again, and attach your JSON data file"

    const pendingList = new PendingDataPorts()
    await pendingList.loadDocument()

    const guildId = message.guild.id
    const memberId = message.member.id

    if (pendingList.allPending.find(x => x.guildId === guildId && x.memberId === memberId))
        return "You already have a pending import for this server"

    pendingList.allPending.push({
        guildId,
        memberId,
        isImport: true,
    })

    await pendingList.save()
    return "Your import will be processed within one hour and you will be private messaged when it completes. Please make sure you allow direct messages from server members."
}

export default new Command(
    /*syntax*/          "import",
    /*description*/     "Import data for this guild from JSON",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke,
)