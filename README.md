# WhatsApp audio transcription

This application transcribe WhatsApp audio messages using OpenAI's whisper API.

# Setup

* Create your `.env.local` file using `.env.example` as reference


# Usage

Update .env with your OpenAI API key and make sure you are using NodeJS >= 16.

You can find more information about OpenAI here: https://platform.openai.com/overview

You need ffmpeg installed to convert audio files: https://ffmpeg.org

`npm install`

`node index.js`

The console will show the QR code that you need to read using WhatsApp's option to link a device.
When you link your device, you need to wait for the application to sync with WhatsApp. This may take a while.
It will be ready when you see this message in the console:

🚀 @OPEN-WA ready for account: XXXX

Enjoy.
