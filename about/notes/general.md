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

