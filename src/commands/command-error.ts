import { FriendlyError } from "../core/friendly-error"

export class CommandError extends FriendlyError {
    private static getFriendlyMessage(reason: CommandErrorReason) {
        switch (reason) {
            case CommandErrorReason.UserMissingPermissions:
                return "You do not have permission to use this command"
            case CommandErrorReason.IncorrectSyntax:
                return "Incorrect syntax! See correct syntax with the `help` command"
            case CommandErrorReason.BotMissingGuildPermissions:
                return "The bot has not been granted the necessary permissions in this server. Please grant the permissions and try again. Details can be found in the readme you used to invite the bot."
        }
    }

    constructor(
        public reason: CommandErrorReason,
    ) {
        super(CommandError.getFriendlyMessage(reason), true)

        Object.setPrototypeOf(this, CommandError.prototype)
    }
}

export enum CommandErrorReason {
    UserMissingPermissions,
    BotMissingGuildPermissions,
    IncorrectSyntax,
}