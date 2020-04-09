# Fixture ElementQL Server


    // REQUEST


    curl http://localhost:33300/elementql \
        -H "Content-Type: application/elementql" \
        --data "ReactElement, element"



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
