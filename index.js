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
const secret_word = process.env.SECRET_WORD ? process.env.SECRET_WORD : '!ler'

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
//}).then( client => { client.onAnyMessage( processMessage() )} );
}).then(client => start(client));

async function start(client) {
    client.onAnyMessage(async message => processMessage(message,client) )
}

function isManualTranslation( message ) {
    if  (      message.body 
                && message.body === secret_word 
                && message.quotedMsg 
                && message.quotedMsg.mimetype
                && message.quotedMsg.mimetype.includes("audio")){
                    return true
                }     else { return false}
}
function isAutomaticTranslation( message ) {
    return ( 
    ( message.mimetype && message.mimetype.includes("audio") ) //Has Audio
    && 
    ( 
        ( ! message.isGroupMsg ) //Is a regular message, not a group
        || 
        ( allowedGroups.indexOf(message.chatId) !== -1)  // It's in the allowed group ?
    )
    )
}

function shouldBeTranslated( message ) {
    return isManualTranslation( message ) || isAutomaticTranslation( message )
}

async function processMessage( message , client){
    if ( process.env.DEBUG ) { console.log( message ); }
    if ( message && shouldBeTranslated( message ) ) {
        audioMessage = message.body === secret_word ? message.quotedMsg : message
        const filename = `${path_mp3}/${audioMessage.t}.${mime.extension(audioMessage.mimetype)}`;
        const mediaData = await wa.decryptMedia(audioMessage);
        fs.writeFile(filename, mediaData, async err => { if( err ) { return console.log(err); }})
        const resp = await openai.createTranscription( fs.createReadStream(`${filename}`), "whisper-1" );
	await client.reply(audioMessage.chatId, `🗣️ \`\`\`${resp.data.text}\`\`\``, audioMessage.id);
	//await fs.unlink(filename) 
    }
}

