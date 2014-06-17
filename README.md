Hapi Place
==========

Hapi Place is the web client that people interface with for Hapi container management.

## Installation

    cd paasta
    make build n=base
    make build n=monger
    make build n=place
    # Production
    make run n=place r="-d -v /var/run/docker.sock:/var/docker.sock -v /data/db:/data/db --name=www.hapi.co"
    # Development
    make run n=place r="-d -v /var/run/docker.sock:/var/docker.sock --name=dev.hapi.co"

## Usage

    curl http://www.hapi.co

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.

## Release History

+ 0.0.1 Initial release
