import * as Datastore from "nedb-core"
import { join } from "path"
import { IDbClient } from "./db-client"
import { promisify } from "typed-promisify"
import logger from "../utilities/logger";

export default class NedbClient implements IDbClient
{
    private writeCount: number = 0
    private baseDir: string
    private collections: Datastore[] = new Array<Datastore>()

    public isMongo = false

    public async updateOne(collectionName: string, query: any, update: any): Promise<void>
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.update, collection)(query, update, { })
        this.incrementWriteCount()
    }

    public async insertOne(collectionName: string, record: any): Promise<void>
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.insert, collection)(record)
        this.incrementWriteCount()
    }

    public async findOne(collectionName: string, query: any)
    {
        const collection = this.getCollection(collectionName)
        return promisify(collection.findOne, collection)(query)
    }

    public async deleteOne(collectionName: string, query: any)
    {
        const collection = this.getCollection(collectionName)
        await promisify(collection.remove, collection)(query)
    }

    private getCollection(name: string): Datastore
    {
        const filename = join(this.baseDir, name)
        let collection = this.collections.find(x => x.filename === filename)
        if (!collection)
        {
            collection = new Datastore({ filename, autoload: true })
            this.collections.push(collection!)
        }

        return collection!
    }

    private incrementWriteCount()
    {
        this.writeCount++

        //compact the data file every 10 accesses
        if (this.writeCount > 10)
        {
            for (let collection of this.collections)
                collection.persistence.compactDatafile()
            this.writeCount = 0
            logger.debugLog("Compacted NeDB collections")
        }
    }

    constructor(connectionString: string)
    {
        this.baseDir = /^nedb:\/\/(.+)/.exec(connectionString)![1]
    }
}
