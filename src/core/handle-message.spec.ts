// tslint:disable: no-floating-promises
import { AsyncTest, Expect, Setup, TestFixture } from "alsatian";
import { Message as DjsMessage } from "discord.js";
import { IMock, It, Mock, Times } from "typemoq";
import { BotMessage, Client } from "..";
import { CommandError, CommandErrorReason } from "../commands/command-error";
import handleMessage from "./handle-message";

@TestFixture("Message handling")
export class HandleMessageTestFixture
{
    private client: IMock<Client<BotMessage>>
    private djsMessage: IMock<DjsMessage>

    private setMessageMember(memberId: string)
    {
        this.djsMessage = Mock.ofType() as IMock<DjsMessage>
        this.djsMessage.setup(x => x.member)
            .returns(() =>
            {
                return {
                    id: memberId,
                    guild: { me: { id: "bot-id" }, commandPrefix: null },
                } as any
            })
        this.djsMessage.setup(x => x.guild)
            .returns(() =>
            {
                return {
                    id: "guild-id",
                    commandPrefix: null,
                } as any
            })
    }

    @Setup
    public setup()
    {
        // this.client = Mock.ofType<Client<BotMessage>>(Client, MockBehavior.Loose, true, "", [], BotMessage)
        this.client = Mock.ofType() as IMock<Client<BotMessage>>
        this.client.setup(x => x.botId)
            .returns(() => "bot-id")

        this.setMessageMember("member-id")
    }

    @AsyncTest()
    public async doesnt_reply_or_dispatch_when_message_from_self()
    {
        // ARRANGE
        this.setMessageMember("bot-id")

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object)

        // ASSERT
        this.djsMessage.verify(x => x.reply(It.isAny()), Times.never())
        this.client.verify(x => x.dispatchMessage(It.isAny()), Times.never())
    }

    @AsyncTest()
    public async dispatches_when_non_command_message()
    {
        // ARRANGE
        this.djsMessage.setup(x => x.content)
            .returns(() => "just an ordinary chat message")

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object)

        // ASSERT
        this.client.verify(x => x.dispatchMessage(It.isAny()), Times.once())
    }

    @AsyncTest()
    public async replies_and_dispatches_when_command_in_message()
    {
        // ARRANGE
        const self = this
        class Message
        {
            public guild = { hasPermissions: (_: any) => true }
            public reply(msg: string) { self.djsMessage.object.reply(msg) }
        }

        this.client.setup(x => x.messageCtor)
            .returns(() => Message as any)

        const getCommandInvokerFunc =
            () => Promise.resolve(
                (): any => Promise.resolve("result"))

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object, getCommandInvokerFunc)

        // ASSERT
        this.djsMessage.verify(x => x.reply("result"), Times.once())
        this.client.verify(x => x.dispatchMessage(It.isAny()), Times.once())
    }

    @AsyncTest()
    public async replies_and_dispatches_when_command_throws_friendly_error()
    {
        // ARRANGE
        const self = this
        class Message
        {
            public guild = { hasPermissions: (_: any) => true }
            public reply(msg: string) { self.djsMessage.object.reply(msg) }
        }

        this.client.setup(x => x.messageCtor)
            .returns(() => Message as any)

        const getCommandInvokerFunc =
            () => Promise.resolve(
                (): any => { throw new CommandError(CommandErrorReason.UserMissingPermissions) })

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object, getCommandInvokerFunc)

        // ASSERT
        this.djsMessage.verify(x => x.reply(It.isAnyString()), Times.once())
        this.client.verify(x => x.dispatchMessage(It.isAny()), Times.once())
    }

    @AsyncTest()
    public async replies_and_dispatches_when_guild_missing_permission()
    {
        // ARRANGE
        const self = this
        class Message
        {
            public guild = { hasPermissions: (_: any) => false }
            public reply(msg: string) { self.djsMessage.object.reply(msg) }
        }

        this.client.setup(x => x.messageCtor)
            .returns(() => Message as any)

        const getCommandInvokerFunc =
            () => Promise.resolve(
                (): any => Promise.resolve("result"))

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object, getCommandInvokerFunc)

        // ASSERT
        this.djsMessage.verify(x => x.reply(It.isAnyString()), Times.once())
        this.client.verify(x => x.dispatchMessage(It.isAny()), Times.once())
    }

    @AsyncTest()
    public async doesnt_invoke_command_when_guild_missing_permissions()
    {
        // ARRANGE
        const self = this
        class Message
        {
            public guild = { hasPermissions: (_: any) => false }
            public reply(msg: string) { self.djsMessage.object.reply(msg) }
        }

        this.client.setup(x => x.messageCtor)
            .returns(() => Message as any)

        let commandInvoked = false
        const getCommandInvokerFunc =
            () => Promise.resolve(
                (): any =>
                {
                    commandInvoked = true;
                    Promise.resolve("result")
                })

        // ACT
        await handleMessage(this.client.object, this.djsMessage.object, getCommandInvokerFunc)

        // ASSERT
        Expect(commandInvoked).toBe(false)
    }
}