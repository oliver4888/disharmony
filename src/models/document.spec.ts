// tslint:disable: no-floating-promises
import { AsyncTest, Expect, Setup, Test, TestFixture } from "alsatian"
import { IMock, It, Mock, Times } from "typemoq"
import { IDbClient } from "../database/db-client"
import Document from "./document"

@TestFixture("Document base class")
export class DocumentTestFixture
{
    public dbClient: IMock<IDbClient>

    @Setup
    public setup()
    {
        this.dbClient = Mock.ofType<IDbClient>()
        this.dbClient.setup(x => x.isReconnecting).returns(() => false)
    }

    @AsyncTest()
    public async db_client_receives_insert_when_load_document_called_for_new_record()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            public get num() { return this.record.num }
            public set num(value: number) { this.record.num = value }
            constructor()
            {
                super("id")
                this.isNewRecord = true
            }
        }

        this.dbClient
            .setup(x => x.findOne(It.isAnyString(), It.isAny()))
            .returns(() => Promise.resolve(null))

        // ACT
        const sut = new Derived()
        await sut.loadDocument()

        // ASSERT
        this.dbClient.verify(x => x.insertOne("Derived", { _id: "id" }), Times.once())
    }

    @Test()
    public db_client_receives_insert_when_new_serializable_saved()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            constructor()
            {
                super("id")
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
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            public get num() { return this.record.num }
            public set num(value: number) { this.record.num = value }
            constructor()
            {
                super("id")
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
    public async db_client_receives_replace_when_neither_update_nor_insert_valid()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            constructor()
            {
                super("id")
                this.record = { arr: [0, 1, 2] }
                this.isNewRecord = false
            }
        }

        const sut = new Derived();

        // ACT
        // In-place array modifications aren't detectable, so won't be included as a $set operator
        (sut as any).record.arr.splice(0, 1)
        await sut.save()

        // ASSERT
        this.dbClient.verify(x => x.replaceOne("Derived", { _id: "id" }, { _id: "id", arr: [1, 2] }), Times.once())
    }

    @AsyncTest()
    public async db_client_in_ready_state_when_save_complete()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            constructor()
            {
                super("id")
                this.record = { a: 1 }
                this.isNewRecord = true
            }
        }

        const sut = new Derived()
        sut.updateFields = { whatever: "abc" };
        (sut as any).isNewRecord = true

        // ACT
        await sut.save()

        // ASSERT
        Expect(Object.keys(sut.updateFields).length).toBe(0)
        Expect((sut as any).isNewRecord).toBe(false)
    }

    @AsyncTest()
    public async serializable_record_set_to_db_value_when_serializable_loads_record()
    {
        // ARRANGE
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id") }
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
        Document.dbClient = this.dbClient.object
        class Derived extends Document
        {
            get exposedRecord() { return this.record }
            constructor() { super("id") }
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