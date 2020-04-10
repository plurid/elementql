# Fixture ElementQL Server


    // REQUEST


    // JSON REQUEST

    curl http://localhost:33300/elementql \
        -H "Content-Type: application/json" \
        -v --data '{"elements":[{"name":"AnElement"}]}'


    // ELEMENTQL REQUEST

    curl http://localhost:33300/elementql \
        -H "Content-Type: application/elementql" \
        --data "import {\n    <element>\n}"


    // SCHEMA

    import {
        <element>
    }


    // RESPONSE

    [
        {
            js: 'http://localhost:33300/elementql/element.js',
            css: 'http://localhost:33300/elementql/element.css'
        }
    ]


    Element Transport Layer
