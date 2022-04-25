const textToSpeech = require('@google-cloud/text-to-speech');
const player = require('play-sound')(opts = {})
const Say = require('say').Say
const say = new Say('darwin')
const { default: diff } = require('simple-text-diff');
const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const playText = async (text) => {
    return new Promise(async (resolve, reject) => {
        say.speak(text, 'Anna', 0.7, () => {
            resolve();
        })
    })
}

const loadText = (filePath) => {
    return new Promise((res, rej) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                rej(err)
                return
            }
            res(data)
        })
    })
}

const speakSentence = async (text) => {
    const parts = text.split(' ');

    const size = 4;
    const chunks = [];
    while (parts.length) {
        chunks.push(parts.splice(0, size));
    }

    console.log(text);

    for (let i = 0; i < chunks.length; i++) {
        await playText(chunks[i].join(' '));
        await sleep(5000)
    }
}

app.get("/", async (req, res) => {
    const input = await loadText('./input.txt');
    const written = await loadText('./text.txt');

    const result = diff.diffPatch(written, input);
    res.send(`<html><style>ins { color: red;} del { color: green;}</style><p>${ result.after }</p><body></body></html>`);
});


async function quickStart() {
    const text = await loadText('./input.txt');
    const sentences = text.split('.\n');

    console.log(`Words: ${ text.split(' ').length }`)
    console.log(`Chars: ${ text.length }`)
    console.log(`-----------------------------------`)

    for (let i = 0; i < sentences.length; i++) {
        await playText('Ganzer satz');
        await playText(sentences[i]);
        await playText('Satz ende');

        await speakSentence(sentences[i]);
        await playText('Punkt');
        await playText('Satz wiederholen');
        await playText(sentences[i]);
    }

    await playText('Diktat ende');
}

quickStart();
