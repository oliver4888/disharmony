import Document from "../document"

export type PendingDataPort = { guildId: string, memberId: string, isImport: boolean, url?: string }

export default class PendingDataPorts extends Document
{
    public allPending: PendingDataPort[] = new Array<PendingDataPort>()

    /** @inheritdoc */
    public loadRecord(record: any): void
    {
        this.allPending = record.pendingExports || []
        return super.loadRecord(record)
    }

    public toRecord(): any
    {
        this.record.pendingExports = this.allPending
        return super.toRecord()
    }

    constructor()
    {
        super("pending-exports-document")
    }
}