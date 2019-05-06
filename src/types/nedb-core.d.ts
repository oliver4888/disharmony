declare module "nedb-core"

declare class Persistence
{
    public compactDatafile(): void
}

declare class Datastore
{
    public filename: string
    public persistence: Persistence
    public update(query: any, record: any, options: { upsert?: boolean }, callback: (err: any, numReplaced?: number) => void): void
    public findOne(query: any, callback: (err: any, result: any) => void): void
    public remove(query: any, callback: (err: any, numRemoved: number) => void): void
    public insert(record: any, callback: (err: any, newDoc: any) => void): void

    constructor(options: { filename: string, autoload: boolean })
}