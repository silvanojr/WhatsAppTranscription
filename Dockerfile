FROM  openwa/wa-automate
USER root
WORKDIR /app
COPY . /app/
RUN npm install --production
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["index.js"]
