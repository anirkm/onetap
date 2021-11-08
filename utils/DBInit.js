// —— The fastest and simplest library for SQLite3 in Node.js.
const db = require("better-sqlite3")("data/Database.db");


db.pragma("journal_mode = wal");
db.pragma("synchronous = 1");

db.exec(
    `
        CREATE TABLE IF NOT EXISTS channels (
            "guildID"       TEXT,
            "channelID"     TEXT,
            "ownerID"       TEXT
        );

        CREATE TABLE IF NOT EXISTS cf (
            "guildID"       TEXT,
            "userID"        TEXT,
            "frID"          TEXT,
            "timestamp"     INTEGER
        );

        CREATE TABLE IF NOT EXISTS bl (
            "guildID"       TEXT,
            "userID"        TEXT,
            "BlID"          TEXT,
            "timestamp"     INTEGER
        );
    `,
);

module.exports = db;