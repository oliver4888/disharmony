import { Collection, Db, MongoClient as MongoClientActual } from "mongodb"
import { IDbClient } from "./db-client"

export default class MongoClient implements IDbClient
{
    private connectionPromise: Promise<void>
    private connectionString: string
    private client: MongoClientActual
    private db: Db
    public isMongo = true

    public async updateOne(collectionName: string, query: any, update: any): Promise<void>
    {
        await (await this.getCollection(collectionName))
            .updateOne(query, update)
    }

    public async insertOne(collectionName: string, record: any): Promise<void>
    {
        await (await this.getCollection(collectionName))
            .insertOne(record)
    }

    public async findOne(collectionName: string, query: any)
    {
        return (await this.getCollection(collectionName))
            .findOne(query)
    }

    public async deleteOne(collectionName: string, query: any)
    {
        await (await this.getCollection(collectionName))
            .deleteOne(query)
    }

    public async getCollection(collectionName: string): Promise<Collection>
    {
        await this.connectionPromise
        return this.db.collection(collectionName)
    }

    private async connectDb()
    {
        this.client = await MongoClientActual.connect(this.connectionString, { useNewUrlParser: true })
        this.db = this.client.db()
    }

    constructor(connectionString: string)
    {
        this.connectionString = connectionString
        this.connectionPromise = this.connectDb().catch(err => { throw new Error("Failed to connect to database" + err ? err.message || err : "") })
    }
}