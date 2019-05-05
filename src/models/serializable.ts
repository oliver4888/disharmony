export default abstract class Serializable
{
    protected record: any = {}

    public abstract toRecord(): any
    public abstract loadRecord(record: any): void
}