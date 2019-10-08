import { Logger } from ".."
import PendingExports, { PendingExport } from "../models/internal/pending-exports"
import WorkerAction from "./worker-action"

export default class ExportGenerator extends WorkerAction
{
    /** @override */
    public async invoke()
    {
        await Logger.debugLog("Beginning iteration of pending exports")

        const pendingExports = new PendingExports()
        await pendingExports.loadDocument()

        for (const pendingExport of pendingExports.allPending)
            await this.processExportForPendingEntry(pendingExport)

        await Logger.debugLog("Finished iterating pending exports")
    }

    public async processExportForPendingEntry(pendingExport: PendingExport)
    {
        // Fetch data for this guild

        // Generate file containing JSON

        // Send JSON file to member

        // Handle what to do if the file is too big for Discord's upload limit
    }
}

WorkerAction.bootstrapModuleIfInWorker(ExportGenerator)