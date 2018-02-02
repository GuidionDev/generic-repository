# generic-repository

[![Build Status](https://travis-ci.org/GuidionDev/generic-repository.svg?branch=master)](https://travis-ci.org/GuidionDev/generic-repository)

### Generic repository pattern implementation for node.js. Currently supports mongo and in-memory(testing) databases.

## Why would i use this? 

You want to separate your business logic from your datalayer easily, with a typed promise result from your queries

## Quickstart

Make connection To your database:

```js
import MongoConnect from '../mongodb_connect';
onReady = new MongoConnect().connect('MY_CONNECTION_STRING');
```

Just create a new instance of the repository you need, with the appropriate Type passed in like: 

```js
db = new MongoDBRepository(SomeObject);
```

Now you are ready to query!

```js
db.findOne({_id: '12345'}).then(doc: SomeObject => console.log(doc));
```

## But wait.. there's more!

If you are using enviroment variables for your connection string/credentials you don't need to pass it to connect, if you use this variable naming:
DB\_URI for your connection string
DB\_USER for your username
DB\_PASS for your password

## Automatically seed your database

In case you have data you always want to have present in your database, you can use the Seed class to check for this data, and insert if needed:

```js
db = new MongoDBRepository<SomeObject>(SomeObject);
seeder = new Seed(db, '_name', locationOfYourSeedFile(s));
seeder.seed();
```
In this case '_name' is the field that the seeder will use to check if your data already exists

The seeder will look for a SomeObject.seed.js file in the given directory, the structure of this file should look something like this:

```js
export const SomeObject = {
  data: [{
    _id: 'some_id',
    _name: 'a name that is unique'
  },
  {
    _id: 'another_id',
    _name: 'a name that is also unique'
  }]
};
export default SomeObject;
```
