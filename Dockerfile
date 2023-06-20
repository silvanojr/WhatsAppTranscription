FROM  openwa/wa-automate
USER root
WORKDIR /app
COPY . /app/
RUN apt update ; apt install -y ffmpeg ;  npm install
CMD ['node','index.js']
