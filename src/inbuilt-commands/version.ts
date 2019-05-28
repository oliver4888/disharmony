import Command, { PermissionLevel } from "../commands/command"

function invoke()
{
    return Promise.resolve(require(process.cwd() + "/package.json").version)
}

export default new Command(
    /*syntax*/          "version",
    /*description*/     "Returns the current version of the bot",
    /*permissionLevel*/ PermissionLevel.Anyone,
    /*invoke*/          invoke,
)