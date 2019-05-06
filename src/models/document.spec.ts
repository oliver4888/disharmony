// tslint:disable: no-floating-promises
import { AsyncTest, Expect, Setup, Test } from "alsatian"
import { IMock, It, Mock, Times } from "typemoq"
import { IDbClient } from "../database/db-client";
import Document from "./document";

export class DocumentTests
{
    public dbClient: IMock<IDbClient>

    @Setup
    public setup()
    {
        this.dbClient = Mock.ofType<IDbClient>()
    }

    @Test()
    public db_client_receives_insert_when_new_serializable_saved()
    {
        // ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            constructor()
            {
                super("id", dbClientObject)
                this.record = { a: 1 }
                this.isNewRecord = true
            }
        }

        // ACT
        new Derived().save()

        // ASSERT
        this.dbClient.verify(x => x.insertOne("Derived", { _id: "id", a: 1 }), Times.once())
    }

    @AsyncTest()
    public async db_client_receives_update_when_serializable_updated_and_saved()
    {
        // ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            public get num() { return this.record.num }
            public set num(value: number) { this.record.num = value }
            constructor()
            {
                super("id", dbClientObject)
                this.isNewRecord = false
            }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.resolve({ num: 1 }))

        // ACT
        const sut = new Derived()
        await sut.loadDocument()
        sut.num = 2
        sut.save()

        // ASSERT
        this.dbClient.verify(x => x.updateOne("Derived", { _id: "id" }, { $set: { num: 2 } }), Times.once())
    }

    @AsyncTest()
    public async serializable_record_set_to_db_value_when_serializable_loads_record()
    {
        // ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id", dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.resolve({ a: 1 }))

        // ACT
        const sut = new Derived()
        await sut.loadDocument()

        // ASSERT
        Expect(sut.exposedRecord).toEqual({ a: 1 })
    }

    @AsyncTest()
    public async load_document_throws_if_error_returned_when_serializable_loads_record()
    {
        // ARRANGE
        const dbClientObject = this.dbClient.object
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id", dbClientObject) }
        }

        this.dbClient
            .setup(x => x.findOne("Derived", It.isAny()))
            .returns(() => Promise.reject("error"))

        // ACT
        const sut = new Derived()

        // ASSERT
        await Expect(async () => await sut.loadDocument()).toThrowAsync()
    }
}