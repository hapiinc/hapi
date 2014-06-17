.PHONY: all

all:
	npm install
	forever stopall
	forever start --minUptime 1000 \
                  --spinSleepTime 1000 \
                  -a \
                  -l ${HOME}/temp/log \
                  -m 5 \
            index.js --dbport=27017 \
                     --dbhost=127.0.0.1 \
                     --port=8080 \
                     --host=0.0.0.0 \
                     --environment=production
	forever list
