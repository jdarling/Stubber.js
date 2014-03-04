Stubber.js
===========

Stubber.js a lightweight Resourcefully RESTful Stub API provider.  Currently it only supports it's own propriatory format, but plans are to support multiple output formats to allow it to simulate any RESTful API.

See **Planned Features** for more details

**NOTE:** This document is a work in progress!  Please submit Pull requests with updates/fixes to the project or the documentation.

Requirements
------------

  * [Node.js](http://nodejs.org/)
  * [MongoDB](http://mongodb.org/)

Why?
----

Too many times of needing to stand up a temporary stub provider for data that would eventually be replaced with a real RESTful web service.  Stubber was started as a generic solution to this problem with the idea of placing it behind a gateway provider that would do any additional transformations of the data as necessary and would be switched over to point at a live provider once one was available.

Installation
============

    npm install stubber

Configuration
=============

Stubber.js is configured by setting the appropriate values in the config.json file within its root path.  The default config.json file is:

```
{
  default: {
    web: {
      webroot: './webroot',
      port: 8080
    },
    store: {
      type: 'memory'
      /* an example of mongo
      type: 'mongo',
      connectionString: 'mongodb://localhost:27017/stubber'
      */
    }
  }
}
```

  * default.web.webroot sets where the static HTML source files are served for the UI.
  * default.web.port is the port that the HTTP server will listen on.
  * Yes, I know, that isn't valid JSON.  Live with it, the config loader lets you pass in pretty dirty JSON instead of nice clean JSON.

Stores
======

The idea of stores is to abstract the storage engine from the functionality of Stubber.js.  This means you can utilize your favorite database or file format for storing your stubs.  Or in the case where you really don't care, you can always use the built in memory store that will just hold things till its restarted.

Stores need to conform to the following prototype in order to be used:

```
Store(name)
  get(_id, callback)
    callback(error, record)
  insert(record, callback)
    callback(error, record)
  update(_id, record, callback)
    callback(error, record)
  delete(_id, callback)
    callback(error, numberRecordsDeleted)
  count(callback)
    callback(error, numberRecordsInStore)
  toArray(offset, limit, callback)
    callback(error, arrayOfRecords)
```

And allows for the following usage:

```
//To create a new store:
var store = new Store('MyStore');

//To add a record to a store:
store.insert({some: 'value'}, function(err, record){
  console.log('record added', record._id);
});

//To update a record:
store.update(123, {some: 'value', another: 'value'}, function(err, record){
  console.log('record udpated', record._id);
});

//To delete a record:
store.delete(123, function(err, deleted){
  if(deleted){
    console.log('deleted '+deleted+' records');
  }else{
    console.log('no records deleted');
  }
});

// etc...
```

So any other NPM modules out there that you want to use as a store you can, as long as it conforms to the above or can be modified to fit the above.  See /lib/stores/mongo.js for an example.

To do that just npm install your store, then set the NPM Module name to the store.type in your config.json file.

API
===

All endpoints are documented at <HTTP Method>://<resource path>
Where HTTP Method is the name of the appropriate HTTP Method to envoke on the resource and resource path is the actual path that the resource resides at.  When dynamic properties (or variable values) are concerned the reference name is preceeded by a :

GET://api/v1/schemas
--------------------

Provides a pagged listing of all available schemas known within the running instance of Stubber.js

GET://api/v1/schema/:schemaName
-------------------------------

Provides just the [JSON-Schema](http://json-schema.org/) schema for a particular schema by name (Resource Name).  Use this for linking your [JSON-Schema's](http://json-schema.org/) together.

GET://api/v1/resources
----------------------

Provides a pagged listing of known resource types within the running instance of Stubber.js

POST://api/v1/resource
----------------------

Creates a new resource type within the running instance of Stubber.js

PUT://api/v1/resource
---------------------

Creates a new resource type within the running instance of Stubber.js
**NOTE:** You really should use POST://api/v1/resource instead of PUT://api/v1/resource

GET://api/v1/resource/:id
-------------------------

Gets a specific resource by identity and returns its details including the schema attached to it.

PUT://api/v1/resource/:id
-------------------------

Updates a specific resource by identity.

POST://api/v1/resource/:id
--------------------------

Updates a specific resource by identity.
**NOTE:** You really should use PUT://api/v1/resource/:id instead of POST://api/v1/resource/:id

DELETE://api/v1/resource/:id
----------------------------

Deletes a specific resource by identity.

GET://api/v1/stubs/:resourceName
------------------------

Provides a pagged listing of all of the stub records for the specific resource requested.

POST://api/v1/stubs/:resourceName
-------------------------

Creates a new stub for the named resource within the running instance of Stubber.js

PUT://api/v1/stubs/:resourceName
-------------------------

Creates a new stub for the named resource within the running instance of Stubber.js
**NOTE:** You really should use POST://api/v1/stubs/:resourceName instead of PUT://api/v1/stubs/:resourceName

GET://api/v1/stubs/:resourceName/:id
----------------------------

Gets a specific stub by identity from a named resource and returns its details back to the caller.

PUT://api/v1/stubs/:resourceName/:id
----------------------------

Updates a specific stub by identity from the named resource.

POST://api/v1/stubs/:resourceName/:id
-----------------------------

Updates a specific stub by identity from the named resource.
**NOTE:** You really should use PUT://api/v1/stubs/:resourceName/:id instead of POST://api/v1/stubs/:resourceName/:id

DELETE://api/v1/stubs/:resourceName/:id
-------------------------------

Deletes a specific stub by identity for a particular named resource.

Output Format
=============

The output from Stubber.js will always be a JSON response that falls in to one of three specific response types.  The three response types are detailed below.

Errors
------

Single error happened, typical case:

```
{
  root: "error",
  error: {
    // All of the details associated with the error will be placed here
  }
}
```

Multiple errors happend, as an example validation of schema:

```
{
  root: "errors",
  errors: [
    {
      // All of the details associated with the error will be placed here
    }
  ]
}
```

Listing
-------

```
{
  root: <listingResourceName>
  <listingResourceName>: [
    // array of resources
  ]
  limit: //number of resources the result is limited to
  offset: // offset of this block within the full result set
  count: // total number of resources that were returned
  length: // total number of resources that could have been returned
  methods: {
    // list of http endpoints that can be accessed, approprite method required
  }
}
```

Singular
--------

```
{
  root: <resourceName>
  <resourceName>: {
    // singular resource result
  }
  methods: {
    // list of http endpoints that can be accessed, approprite method required
  }
}
```

Planned Features
================

  1. An actual UI for Resource Type management and stub record management.
  2. Support for other output formats than the default Stubber.js one.
  3. Bulk import of stubs.
  4. Maybe provide some type of authentication or application key concept???

Update History
==============

  * v0.0.2
    - Abstracted out the concept of stores
    - Added an in memory store as the default store
    - Converted existing MongoStore to a plugin store

  * v0.0.1
    - Initial Alpha Release
    - This is a really rough release of the general concept
