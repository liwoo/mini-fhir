## MINI FHIR

This is an implementation of a FHIR Server built in Node.js. Particularly it allows a user to create an Observation as well as query the Vital Sign Profile according to the FHIR Standard.

For The exact functionality, you may refer to the test cases in the integration suites.

## Instructions

Clone this repository onto your server and do the necessary setup for any Node Project, install dependancies: `npm i`; run the tests `npm test`; populate the database `npm run seed` and start the server `npm start`. Oh, make sure you change the configurations before (under `/config`) before doing so. The project assumes that you have mongodb running either on your server in the cloud (I'm looking at you [mLab]("https://mlab.com"))

## Things to Do

### Security Considerations

The server is currently open for anyone to happily hack away. To prevent this, there must be an Authentication Workflow, where the server provides JWT to registered users (a client would need to make a login attempt with their credentials, and upon success be issued with an access token). All requests ought to have the token in the header and the users will be able to access different endpoints depending on their set permissions. There could also be an enforcing of custom headers that the users must send with each request, which may, among many things, inform the server which format to send the data back as. Other considerations may be to send GO_AWAY responses to requests that are persistent and suspicious.

### Frontend

The idea was to add a [_ReactReason_]('https://github.com/reasonml/reason-react') or [_Elm_]('https://elm-lang.org/') Front end that will be able to list all observations and allow a user to view the observation data as well as create new observations with a form. The app would also have a search bar where a user can search based on a patient name and it will return observations of that particular patient!
