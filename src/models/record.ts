export interface IRecord
{
    toRecord(): any
    loadRecord(record: any): void
}

export default abstract class Record implements IRecord
{
    protected record: any = {}
    protected isNewRecord = false

    public toRecord(): any { return this.record }
    public loadRecord(record: any): void { this.record = record }
}