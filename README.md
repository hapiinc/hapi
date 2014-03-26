Hapi Place
==========

Hapi Place is the web client that people interface with for Hapi container management.

## Installation

    cd paasta
    make build n=place
    make run n=place r="-d -p 22 -p 8080 -e SSHKEY='KEY'"

## Usage

    curl http://www.hapi.co

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.

## Release History

+ 0.0.1 Initial release
