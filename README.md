# management-portal-clr

Management Portal is a front-end component to manage resources registered in [Maritime Identity Registry](https://github.com/maritimeconnectivity/IdentityRegistry) and [Maritime Service Registry](https://github.com/maritimeconnectivity/ServiceRegistry), the core components of [Maritime Connectivity Platform](https://maritimeconnectivity.net/).

This version of Management portal is powered by [Clarity Design System](https://clarity.design/).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.3.

# Live demo

You can experience a live demo from [our public demonstrator environment](https://management.maritimeconnectivity.net).

# Development
## Requirement
- node v20.17.0
- pnpm v8.15.4

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Configuration
Our project is configured to support multiple environments, specifically production, test, and development (see angular.json at the root folder).
The configuration is managed through Angular's built-in environment system, utilizing the /src/environments/ directory.
There are three environments given by default:

- development: environment.development.ts
- test: environment.test.ts
- production: environment.ts

Configuration parameter in each file covers:

* *production*: boolean value of whether a build for production or not
* *irBasePath*: url of MIR API
* *irProvider*: name of the MIR provider
* *irContact*: contact of the MIR provider
* *oidcBasePath*: url of MIR OIDC (keycloak endpoint for the MCC testbed)
* *hasServiceRegistry*: boolean value of whether the provider has service registry or not
* *srBasePath*: url of MSR API if exist
* *srProvider*: name of the MSR provider
* *srContact*: contact of the MSR provider
* hasMSRLedger: boolean value of whether the MSR Ledger is connected
* ledgerPath: url of the MSR Ledger
* *mpProvider*: name of the Management Portal provider
* *mpContact*: contact of the Management Portal provider
* *environmentTitle*: title showing at the front page
* *termsOfUse*: terms of use using in the registration
* *idpNamespace*: identity provider short ID (*IPID* in MCP IDsec2 MCC Identity Management and Security; Identity Management) included in MCP MRN, e.g., 'mcc-test'
* *environmentName*: environment name showing at the front page
* *mpName*: official name of management portal
* *footerName*: a name you can put at footer
* *footerLink*: a link you can put at footer
* *logoImg*: logo image path, will be shown at the front page, e.g., 'assets/images/logo.svg'

You can use configuration by using `-c %CONF_NAME%`. Building with test configuration for example, `ng build -c test`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## GitHub deployment

Run `ng deploy --repo=%REPO_TO_DEPLOY% --cname=%URL --dir="dist/management-portal-clr"` for GitHub Pages deployment

## Localization support
Currently English(en-GB) and Korean(ko-KR) are supported.

## License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
