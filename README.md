# NG-SOAR - Next Generation SOAR

NG-SOAR is a web application for generating, parsing and validating, manipulating, and visualizing CACAO v2.0 playbooks.

# Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
  - [Project status](#project-status)
  - [Screenshots of the application](#screenshots-of-the-application)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Deployment](#deployment)
  - [Tool Owners](#tool-owners)

# Introduction

As cyber systems become increasingly complex and cybersecurity threats become more prominent, defenders must prepare, coordinate, automate, document, and share their response methodologies to the extent possible. The CACAO standard was developed to satisfy the above requirements providing a common machine-readable framework and schema to document cybersecurity operations processes, including defensive tradecraft and tactics, techniques, and procedures.

For wider adoption of the CACAO standard, it is crucial to support and simplify the playbook creation, modification, and understanding. **CACAO Roaster supports the aforementioned by providing a faster and easier way to create, manipulate, visualize and share CACAO playbooks in a “no-code” graphical manner.**

The CACAO Roaster web application complies fully to the [CACAO v2 CS01](https://docs.oasis-open.org/cacao/security-playbooks/v2.0/security-playbooks-v2.0.pdf) specification.

## Project status

The CACAO Roaster is now in a stable version 1.3.0 and is under continuous maintenance.
The maintenance team has an overview of open issues/working items on the GitHub issues page.

### Integration with CACAO Orchestrator

CACAO Roaster includes a basic integration with the CACAO Orchesrtator/executor [SOARCA](https://github.com/COSSAS/SOARCA). 
To use that integration, you need to have a running instance of SOARCA and configure the CACAO Roaster to use it, by setting the `SOARCA_URL` environment variable to the SOARCA instance URL or simply provide the SOARCA URL in the SOARCA integration window in the CACAO Roaster.

Itegration with CACAO Executor - SOARCA.
![Itegration with CACAO Executor - SOARCA.](/artwork/CACAO-Roaster-Integraion.png)


## Screenshots of the application

Start screen of the application.
![Start screen of the application](/artwork/CACAO-Roaster-1.png)

Example of a playbook view.
![Example of a playbook view.](/artwork/CACAO-Roaster-2.png)


# Getting Started

These instructions will get you up and running with the project on your local machine for development purposes. See deployment for notes on how to deploy the project on a live system.

Prerequisites:

* node >= 20.5.0
* npm >= 9.8.0

## Installation

```
npm i
```

**Run the project locally (in development mode)**

```
npm run start
```
The CACAO Roaster will run locally on: http://localhost:3000/

**Building the project for production**

```
npm run build
```

## Deployment

Install serve service on hosting machine

```
npm install serve
```

Host production bundle

```
serve dist
```

Or use [Docker](https://www.docker.com/) to spin up a fully functioning container

```
docker build -t cacao-roaster .
docker run -it -p 3000:3000 cacao-roaster
```

## Tool Owners - Cynetific AS

* Mateusz Zych: [https://github.com/mateusdz](https://github.com/mateusdz)
* Vasileios Mavroeidis: [https://github.com/Vasileios-Mavroeidis](https://github.com/Vasileios-Mavroeidis)
