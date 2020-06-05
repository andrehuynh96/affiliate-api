# Setup

## Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js 10.x.x and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

### Step 2: Create local environment

Copy the `.env.dev` file and rename it to `.env.del.local`. In this file you have to add your database connection information.

Create a new database with the name you have in your `.env`-file.

Then setup your application environment.

```bash
npm install
```

> This installs all dependencies with yarn. After that it migrates the database and seeds some test data into it. So after that your development environment is ready to use.

### Step 3: Serve your App

Go to the project dir and start your app with this yarn script.

```bash
npm run dev
```

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the sever according to these changes.
> The server address will be displayed to you as `http://0.0.0.0:3000`.

## Set up Postgres database

## ❯ Scripts and Tasks

All script are defined in the `package-scripts.js` file, but the most important ones are listed here.

### Install

- Install all dependencies with `npm install`

### Linting

- Run code quality analysis using `npm start lint`. This runs tslint.
- There is also a vscode task for this called `lint`.

### Tests

- Run the unit tests using `npm start test` (There is also a vscode task for this called `test`).
- Run the integration tests using `npm start test.integration`.
- Run the e2e tests using `npm start test.e2e`.

### Running in dev mode

- Run `yarn dev` to to serve the app.
- The server address will be displayed to you as `http://127.0.0.1:3001`

### Building the project and run it

- Run `yarn start build` to generated all JavaScript files from the TypeScript sources (There is also a vscode task for this called `build`).
- To start the builded app located in `dist` use `yarn start`.

## Migration

When you want to change DB then you have to create migration file.

### Migration config

All configs related to migration in `.sequelizerc`

### Create Migration

- In order to create migration then you run command below

```
sequelize migration:create --name name-of-migration || npx sequelize-cli migration:create --name name-of-migration
```

- New file migration will be in `app/model/wallet/migration`

- The format of migration file

```javascript
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
```

- More commands please look at https://sequelize.readthedocs.io/en/latest/docs/migrations/#the-cli
