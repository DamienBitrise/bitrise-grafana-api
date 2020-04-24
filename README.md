# bitrise-grafana-api

Grafana Wrapper for Bitrise API

![](images/Grafana-Dashboard.png)

# Run Locally

## Install Dependencies

```npm i```

## Running Grafana JSON Data Source

```node index.js```

# Run on Repl.it

[![Run on Repl.it](https://repl.it/badge/github/DamienBitrise/bitrise-grafana-api)](https://repl.it/github/DamienBitrise/bitrise-grafana-api)

Just click the button above and when the Repl loads click Run.

Copy the base URL from the running Repl

![](images/replit-url.png)

## The following Grafana JSON Endpoints will be available

- /builds
- /queue
- /running

## Each endpoint will have the following APIs

- **/** should return 200 ok. Used for "Test connection" on the datasource config page.
- **/search** should return available metrics when invoked.
- **/query** should return metrics based on input.
- **/annotations** should return annotations.

## Install Grafana JSON Plugin

**Table Data Source**

- https://github.com/simPod/grafana-json-datasource

**Chart Data Source**

- https://grafana.com/grafana/plugins/simpod-json-datasource

## Generate Personal Access Token for Bitrise API

- https://devcenter.bitrise.io/api/authentication/#authentication

## Configure Grafana JSON Data Sources

**Table**

![](images/TableDataSource.png)

**Charts**

![](images/JSON-Plugin-Config.png)

Using the Base URL from your server or Repl configure two Grafana JSON Data Sources

### Builds Table

**URL:** BASE_URL/running

**Headers**
- Authorization (Personal Access Token for Bitrise API)
- content ('application/json')
- appSlugs (comma seperated list of app slugs) [Optional omit to select all apps]

**URL:** BASE_URL/stats

**Headers**
- Authorization (Personal Access Token for Bitrise API)
- content ('application/json')
- appSlugs (comma seperated list of app slugs) [Optional omit to select all apps]

### Builds Chart

**URL:** BASE_URL/builds

**Headers**
- Authorization (Personal Access Token for Bitrise API)
- content ('application/json')
- appSlugs (comma seperated list of app slugs) [Optional omit to select all apps]

### Queue Chart

**URL:** BASE_URL/queue

**Headers**
- Authorization (Personal Access Token for Bitrise API)
- content ('application/json')
- appSlugs (comma seperated list of app slugs) [Optional omit to select all apps]

## Configure Grafana JSON Dashboard

Just Import Grafana Dashboard JSON here:

https://github.com/DamienBitrise/bitrise-grafana-api/blob/master/Bitrise%20Dashboard.json
