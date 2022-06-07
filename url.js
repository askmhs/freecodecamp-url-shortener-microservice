const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const theUrl = require("url");

const app = express();

const urlSchema = mongoose.Schema({
    original: String,
    short: String
});

const URL = mongoose.model("URL", urlSchema);

app.post("/api/shorturl", async (req, res) => {
    let { url } = req.body;
    url = theUrl.parse(url);
    const short = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    dns.resolve(url.hostname || url.pathname, async (err, address) => {
        if (err) {
            res.json({ error: "invalid url" });
        } else {
            await URL.create({ original: url.href, short });
            
            res.json({
                original_url: url.href,
                short_url: short
            });
        }
    });
});

app.get("/api/shorturl/:short", async (req, res) => {
    const data = await URL.findOne({
        short: req.params.short
    });

    if (data) {
        const url = data.original.includes(["http", "https"]) ? data.original : `http://${data.original}`;
        res.redirect(url);
    } else {
        res.redirect("/");
    }
});

module.exports = app;