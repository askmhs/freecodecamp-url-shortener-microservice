const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");

const app = express();

const urlSchema = mongoose.Schema({
    original: String,
    short: String
});

const URL = mongoose.model("URL", urlSchema);

app.post("/api/shorturl", async (req, res) => {
    const { url } = req.body;
    const short = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    dns.lookup(url, async (err, address) => {
        if (err) {
            res.json({ error: "invalid url" });
        } else {
            await URL.create({ original: url, short });
            
            res.json({
                original_url: url,
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
        res.redirect(`http://${data.original}`);
    } else {
        res.redirect("/");
    }
});

module.exports = app;