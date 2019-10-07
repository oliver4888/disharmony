import Document from "../document"

export type PendingExport = { guildId: string, memberId: string }

export default class PendingExports extends Document
{
    public allPending: PendingExport[] = new Array<PendingExport>()

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