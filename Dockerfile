FROM  openwa/wa-automate
USER root
WORKDIR /app
COPY . /app/
RUN apt update ; apt install -y ffmpeg ;  npm install --production ; rm -fR /var/lib/apt/lists/*
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["index.js"]
