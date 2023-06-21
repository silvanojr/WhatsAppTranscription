const wa = require('@open-wa/wa-automate');
const mime = require('mime-types');
const fs = require('fs');
const { exec } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

wa.create({
    useChrome: true,
    sessionId: "WhatsAppTranscription",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: true,
    popup: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

// If you add group IDs here, audio sent to these groups will be transcribed
const allowedGroups = [
    // '555555555555-1111111111@g.us',  // Group IDs have this format
];

function start(client) {
    client.onAnyMessage(async message => {
        console.log(message);

        if (((allowedGroups.indexOf(message.chatId) !== -1) || message.isGroupMsg === false) && message.mimetype && message.mimetype.includes("audio")) {
            const filename = `${message.t}.${mime.extension(message.mimetype)}`;
            const mediaData = await wa.decryptMedia(message);

            fs.writeFile(filename, mediaData, async function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('The file was saved!');

                // convert to mp3
                exec(`ffmpeg -v 0 -i ${filename} -acodec libmp3lame ${filename}.mp3`, async (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }

                    //console.log(`stdout: ${stdout}`);

                    // call OpenAI's API
                    const resp = await openai.createTranscription(
                        fs.createReadStream(`${filename}.mp3`),
                        .env.proce
                    );

                    client.reply(message.chatId, `🗣️
    \`\`\`${resp.data.text}\`\`\``, message.id);
                });
            });

//         // If you have whisper install and want to use it locally instead of through the API
//         // you can do something like this:
//         exec(`whisper --verbose False --output_format txt ${filename}`, (error, stdout, stderr) => {
//             if (error) {
//                 console.log(`error: ${error.message}`);
//             }
//             if (stderr) {
//                 console.log(`stderr: ${stderr}`);
//             }

//             console.log(`stdout: ${stdout}`);

//             fs.readFile(`${message.t}.txt`, 'utf8', (err, data) => {
//                 if (err) throw err;
//                 console.log("Getting transcription:");
//                 console.log(data);

//                 client.reply(message.chatId, `🗣️
// \`\`\`${data}\`\`\``, message.id);
//             });
//         });
        }

        // // Sample response
        // if (message.body === 'Hi') {
        //   await client.sendText(message.from, '👋 Hello!');
        // }
    });
}
