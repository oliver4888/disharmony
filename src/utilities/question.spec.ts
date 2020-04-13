import { AsyncTest, Expect, Setup, Test, TestFixture } from "alsatian"
import { TextChannel } from "discord.js"
import { SimpleEventDispatcher } from "ste-simple-events"
import { IMock, It, Mock, Times } from "typemoq"
import { Client, DisharmonyGuildMember, DisharmonyMessage } from ".."
import Question, { QuestionRejectionReason } from "./question"

@TestFixture("Question")
export class QuestionTestFixture {
    private messageDispatcher: SimpleEventDispatcher<DisharmonyMessage>
    private channelMock: IMock<TextChannel>
    private clientMock: IMock<Client>
    private askeeMock: IMock<DisharmonyGuildMember>
    private responseMock: IMock<DisharmonyMessage>

    @Setup
    public setup() {
        this.messageDispatcher = new SimpleEventDispatcher<DisharmonyMessage>()

        this.channelMock = Mock.ofType() as IMock<TextChannel>
        this.channelMock
            .setup(x => x.send(It.isAny()))
            .returns(() => Promise.resolve() as any)

        this.clientMock = Mock.ofType<Client>()
        this.clientMock
            .setup(x => x.onMessage)
            .returns(() => this.messageDispatcher)
        this.clientMock
            .setup(x => x.channels)
            .returns(() => new Map<string, TextChannel>([["channelid", this.channelMock.object]]))

        this.askeeMock = Mock.ofType<DisharmonyGuildMember>()
        this.askeeMock
            .setup(x => x.toString())
            .returns(() => "<askee-id>")
        this.askeeMock
            .setup(x => x.id)
            .returns(() => "askee-id")

        this.responseMock = Mock.ofType<DisharmonyMessage>()
        /* Fixes issue where promises resolving with this never finish,
           as the engine iteratively looks for .then until it's undefined */
        this.responseMock.setup(x => (x as any).then).returns(() => undefined)
    }

    @Test()
    public query_string_sent_to_channel() {
        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query")
        // tslint:disable-next-line: no-floating-promises
        sut.send()

        // ASSERT
        this.channelMock.verify(
            x => x.send(It.isValue("query")),
            Times.once())
    }

    @Test()
    public query_string_prefixed_with_askee_mention_if_askee_provided_and_ping_askee_true() {
        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query", this.askeeMock.object, true)
        // tslint:disable-next-line: no-floating-promises
        sut.send()

        // ASSERT
        this.channelMock.verify(
            x => x.send(It.isValue("<askee-id> query")),
            Times.once())
    }

    @AsyncTest()
    public async resolves_with_answer_when_response_within_timeout() {
        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query")
        const responsePromise = sut.send()
        this.messageDispatcher.dispatch(this.responseMock.object)
        const response = await responsePromise

        // ASSERT
        Expect(response).toBe(this.responseMock.object)
    }

    @AsyncTest()
    public async resolves_with_answer_when_askee_provided_and_askee_responds() {
        // ARRANGE
        this.responseMock
            .setup(x => x.member)
            .returns(() => this.askeeMock.object)

        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query", this.askeeMock.object)
        const responsePromise = sut.send()
        this.messageDispatcher.dispatch(this.responseMock.object)
        const response = await responsePromise

        // ASSERT
        Expect(response).toBe(this.responseMock.object)
    }

    @AsyncTest()
    public async does_not_resolve_when_askee_provided_and_other_member_responds() {
        // ARRANGE
        const otherMemberMock = Mock.ofType<DisharmonyGuildMember>()
        otherMemberMock
            .setup(x => x.id)
            .returns(() => "other-id")

        this.responseMock
            .setup(x => x.member)
            .returns(() => otherMemberMock.object)

        let isResolved = false

        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query", this.askeeMock.object)
        // tslint:disable-next-line: no-floating-promises
        sut.send().then(() => isResolved = true)
        this.messageDispatcher.dispatch(this.responseMock.object)

        // ASSERT
        // Allow the .send() promise to resolve, if it is going to (otherwise we Expect() too early, and always pass)
        await new Promise(resolve => setImmediate(resolve))
        Expect(isResolved).toBe(false)
    }

    @AsyncTest()
    public async still_resolves_with_answer_when_askee_provided_and_other_member_responds_before_askee_does() {
        // ARRANGE
        const otherMemberMock = Mock.ofType<DisharmonyGuildMember>()
        otherMemberMock
            .setup(x => x.id)
            .returns(() => "other-id")

        const otherMemberResponseMock = Mock.ofType<DisharmonyMessage>()
        otherMemberResponseMock.setup(x => (x as any).then).returns(() => undefined)
        otherMemberResponseMock
            .setup(x => x.member)
            .returns(() => otherMemberMock.object)

        this.responseMock
            .setup(x => x.member)
            .returns(() => this.askeeMock.object)

        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query", this.askeeMock.object)
        const responsePromise = sut.send()

        this.messageDispatcher.dispatch(otherMemberResponseMock.object)
        await new Promise(resolve => setImmediate(resolve))

        this.messageDispatcher.dispatch(this.responseMock.object)
        await new Promise(resolve => setImmediate(resolve))

        const response = await responsePromise

        // ASSERT
        Expect(response).toBe(this.responseMock.object)
    }

    @AsyncTest()
    public async rejects_with_response_timeout_reason_when_response_not_within_timeout() {
        // ARRANGE
        this.clientMock
            .setup(x => x.config)
            .returns(() => ({ askTimeoutMs: 250 } as any))

        let rejectionValue: any = null

        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query")
        const responsePromise = sut.send()
        await new Promise(resolve => setTimeout(resolve, 250))
        await responsePromise.catch(err => rejectionValue = err)

        // ASSERT
        Expect(rejectionValue).toBe(QuestionRejectionReason.ResponseTimeout)
    }

    // TODO Figure out why this test times out
    /* @AsyncTest()
    public async rejects_with_channel_send_error_reason_when_channel_send_throws()
    {
        // ARRANGE
        this.channelMock
            .setup(x => x.send(It.isAny()))
            .returns(() => Promise.reject())

        this.clientMock
            .setup(x => x.channels)
            .returns(() => new Map<string, TextChannel>([["channelid", this.channelMock.object]]))

        let rejectionValue: any = null

        // ACT
        const sut = new Question(this.clientMock.object, "channelid", "query")
        const responsePromise = sut.send()
        await responsePromise.catch(err => rejectionValue = err)

        // ASSERT
        Expect(rejectionValue).toBe(QuestionRejectionReason.ChannelSendError)
    } */
}