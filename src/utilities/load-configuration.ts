// tslint:disable: no-console
import * as Joi from "@hapi/joi"
import { existsSync } from "fs"
import { resolve } from "path"
import Config from "../models/internal/config"
import { ExitCodes } from "./exit-codes"

export default function <TConfig extends Config>(schema?: Joi.ObjectSchema, configPath: string = "./config.json"): { config: TConfig, isLocalDb: boolean, configPath: string }
{
    let config: TConfig = null as unknown as TConfig
    if (existsSync(configPath))
        config = require(resolve(process.cwd(), configPath))
    else
    {
        console.error("No config file found!")
        process.exit(ExitCodes.ConfigLoadError)
    }

    if (process.env.TOKEN)
        config.token = process.env.TOKEN

    if (process.env.DB_STRING)
        config.dbConnectionString = process.env.DB_STRING

    if (!isConfigValid(config!, schema))
    {
        console.error("Invalid config!")
        process.exit(ExitCodes.ConfigLoadError)
    }

    return {
        config,
        isLocalDb: config!.dbConnectionString.startsWith("nedb://"),
        configPath,
    }
}

export function isConfigValid(config: Config, secondarySchema?: Joi.ObjectSchema)
{
    const primarySchema = Joi.object().keys({
        dbConnectionString: Joi.string().required(),
        token: Joi.string().required(),
        serviceName: Joi.string().required(),
        requiredPermissions: Joi.number().required(),
        askTimeoutMs: Joi.number().required(),
        heartbeat: Joi.object().optional().keys({
            url: Joi.string().required(),
            intervalSec: Joi.number().required(),
        }),
        dbClientConfig: Joi.object().optional(),
    })

    const validationOptions: Joi.ValidationOptions = { allowUnknown: true }

    const primarySchemaError: boolean = !!Joi.validate(config, primarySchema, validationOptions).error

    let secondarySchemaError: boolean = false

    if (secondarySchema)
        secondarySchemaError = !!Joi.validate(config, secondarySchema, validationOptions).error

    return !primarySchemaError && !secondarySchemaError
}