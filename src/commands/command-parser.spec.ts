import { AsyncTest, Expect, Setup, TestFixture } from "alsatian";
import { IMock, Mock } from "typemoq";
import { BotGuild, BotGuildMember, BotMessage, IClient } from "..";
import Command, { PermissionLevel } from "./command";
import { CommandErrorReason } from "./command-error";
import getCommandInvoker from "./command-parser";

@TestFixture("Command parsing")
export class CommandParserTestFixture
{
    private command: Command
    private client: IClient
    private guild: IMock<BotGuild>
    private member: IMock<BotGuildMember>
    private message: IMock<BotMessage>

    @Setup
    public async setup()
    {
        // Don't actually pass types into mocks as I don't want constructors being invoked

        const command: any = {}
        command.syntax = "valid"
        command.permissionLevel = PermissionLevel.Anyone;
        this.command = command

        const client: any = {}
        client.botId = "botid"
        client.commands = [this.command]
        this.client = client

        this.guild = Mock.ofType() as IMock<BotGuild>
        this.guild.setup(x => x.commandPrefix)
            .returns(() => null)

        this.member = Mock.ofType() as IMock<BotGuildMember>
        this.member.setup(x => x.getPermissionLevel())
            .returns(() => PermissionLevel.Anyone)

        this.message = Mock.ofType() as IMock<BotMessage>
        this.message.setup(x => x.guild)
            .returns(() => this.guild.object)
        this.message.setup(x => x.member)
            .returns(() => this.member.object)
    }

    @AsyncTest()
    public async null_invoker_when_no_command_syntax_in_message()
    {
        // ARRANGE
        this.message.setup(x => x.content)
            .returns(() => "just a normal chat message")

        // ACT
        const invoker = await getCommandInvoker(this.client, this.message.object)

        // ASSERT
        Expect(invoker).toBeNull()
    }

    @AsyncTest()
    public async null_invoker_when_non_existant_command_in_message()
    {
        // ARRANGE
        this.message.setup(x => x.content)
            .returns(() => "<@botid> invalidcommand")

        // ACT
        const invoker = await getCommandInvoker(this.client, this.message.object)

        // ASSERT
        Expect(invoker).toBeNull()
    }

    @AsyncTest()
    public async missing_permission_thrown_when_user_permission_level_too_low()
    {
        // ARRANGE
        this.command.permissionLevel = PermissionLevel.Admin

        this.message.setup(x => x.content)
            .returns(() => "<@botid> valid")

        // ACT
        let error: any
        await getCommandInvoker(this.client, this.message.object).catch(reason => error = reason)

        // ASSERT
        Expect(error.reason).toBe(CommandErrorReason.UserMissingPermissions)
    }

    @AsyncTest()
    public async incorrect_syntax_thrown_when_syntax_incorrect()
    {
        // ARRANGE
        this.command.syntax = "valid param1 param2"

        this.message.setup(x => x.content)
            .returns(() => "<@botid> valid")

        // ACT
        let error: any
        await getCommandInvoker(this.client, this.message.object).catch(reason => error = reason)

        // ASSERT
        Expect(error.reason).toBe(CommandErrorReason.IncorrectSyntax)
    }

    @AsyncTest()
    public async returns_working_command_invoker_when_valid_command_in_message()
    {
        // ARRANGE
        this.command.invoke = async () => "invoked"

        this.message.setup(x => x.content)
            .returns(() => "<@botid> valid")

        // ACT
        const invoker = await getCommandInvoker(this.client, this.message.object)
        const result = await invoker!(this.client, this.message.object)

        // ASSERT
        Expect(result).toBe("invoked")
    }

    @AsyncTest()
    public async error_rethrown_when_invoked_command_throws()
    {
        // ARRANGE
        this.command.invoke = async () => { throw new Error("its borked") }

        this.message.setup(x => x.content)
            .returns(() => "<@botid> valid")

        // ACT
        const invoker = await getCommandInvoker(this.client, this.message.object)

        // ASSERT
        await Expect(async() => await invoker!(this.client, this.message.object)).toThrowAsync()
    }

    @AsyncTest()
    public async command_recognised_when_guild_has_command_prefix()
    {
        // ARRANGE
        this.guild = Mock.ofType() as IMock<BotGuild>
        this.guild.setup(x => x.commandPrefix)
            .returns(() => "!")

        this.message.setup(x => x.guild)
            .returns(() => this.guild.object)
        this.message.setup(x => x.content)
            .returns(() => "!valid")

        // ACT
        const invoker = await getCommandInvoker(this.client, this.message.object)

        // ASSERT
        Expect(invoker).toBeDefined()
    }
}