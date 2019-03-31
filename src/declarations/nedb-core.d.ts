declare module "nedb-core"

declare class Persistence
{
    compactDatafile(): void
}

declare class Datastore
{
    filename: string
    persistence: Persistence
    update(query: any, record: any, options: { upsert: boolean }, callback: (err: any, numReplaced?: number) => void): void
    findOne(query: any, callback: (err: any, result: any) => void): void
    remove(query: any, callback: (err: any, numRemoved: number) => void): void

    constructor(options: { filename: string, autoload: boolean })
}