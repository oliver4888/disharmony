# Configuration
An implementing project should include *config.json* in their root folder. There are some required properties, and some optional.

## Required
- `token`: Discord bot token; string
- `dbConnectionString`: Connection string for the selected Mongo-like database (NeDB or MongoDB); string

## Optional
- `heartbeat`: Configuration for the heartbeat ferture object
    - `intervalSec`: Heartbeat interval in seconds; number
    - `url`: Heartbeat url; string

## Sample

```JSON
{
    "token": "tokengoeshere",
    "dbConnectionString": "nedb://nedb-data",
    "heartbeat": {
        "intervalSec": 30,
        "url": "http://heartbeat-url.com/whatever"
    }
}
```