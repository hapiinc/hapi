.PHONY: all

all:
	npm install
	forever stopall
	forever start --minUptime 1000 \
                  --spinSleepTime 1000 \
                  -a \
                  -l /home/git/temp/log \
                  -m 5 \
            index.js --dbport=49161 \
                     --dbhost=hapi.co \
                     --port=8080 \
                     --host=0.0.0.0
	forever list
