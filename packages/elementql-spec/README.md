# ElementQL Specification


## Usage

Client-Side Usage

    // imports the input element defined in the general space
    // this input element is simply named input
    // it may or may not be the same as an HTML Input Element
    elementql`
        import {
            <input>
        }
    `;

    // import the brand element defined in the page1 > footer space
    elementql`
        import {
            page1 {
                footer {
                    <brand>
                }
            }
        }
    `;


Server-Side Usage

    const input = document.createElement('input');

    const brand = document.createElement('div');

    elementql`
        <input> {
            ${input}
        }

        space page1

        space page1 > footer {
            <brand> {
                ${brand}
            }
        }
    `


the developer writes the components, say using React, and places them on the server

the developer must also write the server logic for answering to component requests

the developer writes the client side which asks for components



.elementql file extension




---



initial :

# ElementQL Specification

api.domain.com/elementql


to hit the endpoint to request page components
to hit the endpoint to save the local-current state of the component

    import {
        <custom-element> {
        }
    }

    import {
        <my-input> {
            data {
                name: "email"
                value: "app@expl.com"
            }
            style {
                color: "red"
            }
            function {
                onChange: $onChange
                onFocus: $onFocus
                onBlur: $onBlur
            }
        }
    }

    export {
        <custom-element>
    }


    <div>
        <virtual-custom-element>
    </div>

    <div>
        <custom-element>
    </div>


The user creates the components

/component/button
/component/input
etc

and the containers

/containers/about-page
/containers/contact-page
etc


then sets the ElementsQL server which will take the containers and components


to able to store the code as files

or as text in database
