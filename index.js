const wa = require('@open-wa/wa-automate');
const mime = require('mime-types');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();
const configuration = new Configuration( { apiKey: process.env.OPENAI_API_KEY } );
const openai = new OpenAIApi(configuration);
const path_mp3 = process.env.PATH_MP3 ? process.env.PATH_MP3 : '.' ;
const sessionDataPath = process.env.PATH_SESSION ? process.env.PATH_SESSION : './' ;
const groups = process.env.GROUPS ? process.env.GROUPS : 'xxxx,yyyy' ;
const allowedGroups = groups.split(',');

wa.create({
    useChrome: true,
    sessionId: "WhatsAppTranscription",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 30, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: true,
    popup: true,
    qrTimeout: 300, //0 means it will wait forever for you to scan the qr code
    sessionDataPath,
}).then( client => { client.onAnyMessage( processMessage() )} );

function shouldBeTranslated( message ) {
    return  ( message.mimetype && message.mimetype.includes("audio") //Has Audio
            && 
            ( 
                ( ! message.isGroupMsg ) //Is a regular message
                || 
                ( allowedGroups.indexOf(message.chatId) !== -1)  // It's in the allowed group ?
            )
            )
}

async function processMessage( message ){
    if ( process.env.DEBUG ) { console.log( message ); }
    if ( shouldBeTranslated( message ) ) {
        console.log(`ChatId: ${message.chatId} \n MId: ${message.id}`);
        const filename = `${path_mp3}/${message.t}.${mime.extension(message.mimetype)}`;
        const mediaData = await wa.decryptMedia(message);
        fs.writeFile(filename, mediaData, async err => {
            if ( err ) { return console.log(err); }
            console.log('The file was saved!');
            const resp = await openai.createTranscription( fs.createReadStream(`${filename}`), "whisper-1" );
            console.log(`Texto Traduzido: ${resp.data.text}`);
            await client.sendText( message.chatId, `🗣️ \`\`\`${resp.data.text}\`\`\`` );
        });
    }
}

