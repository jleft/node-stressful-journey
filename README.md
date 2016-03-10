# node-stressful-journey

[![Build Status](https://travis-ci.org/chrisprice/node-stressful-journey.svg?branch=master)](https://travis-ci.org/chrisprice/node-stressful-journey)

A tool for stress testing user journeys through APIs

## Installation

```
npm install -g stressful-journey
```

## Configuration

### Journey steps

To execute a stress test, you need to provide the journey to test. This is specified as a JS module which exports an array of steps (see [`test/example.js`](https://github.com/chrisprice/node-stressful-journey/blob/master/test/example.js) for an example).

`type: 'request'`

The most common step is a request. An HTTP request will be issued and the step will only succeed if the status code is `200`, the content-type is `application/json` and the response is valid JSON. A simple example is -

```js
  {
    type: 'request',
    options: 'http://localhost/hello'
  }
```

The ```options``` value is passed to [```http.request```](https://nodejs.org/api/http.html#http_http_request_options_callback). N.B. ```options.agent``` will always be set to false to prevent connection pooling.

It is also possible to specify a factory method if you want to e.g. template the URL -

```js
  var prefix = 'http://localhost/hello';
  // ...
  options: function(ctx) {
    return prefix + '/hello';
  }
```

The function will be called once per simulated user per run. The `ctx` argument is described below.

If you want to post data or modify the request in other ways, you can specify a function as the `request` value -

```js
  {
    type: 'request',
    options: {
      hostname: 'localhost',
      path: '/echo',
      method: 'POST'
    },
    request: function(ctx, req) {
      req.setHeader('Content-Type', 'application/json');
      req.end(JSON.stringify({hello:'world'}));
    }
```

The `req` argument is an [```http.ClientRequest```](https://nodejs.org/api/http.html#http_class_http_clientrequest). N.B. you must manually `req.end()` the request if you provide a `request` value otherwise the request will not be sent.

Likewise if you want to validate the JSON response you can specify a function as the `response` value -

```js
  {
    type: 'request',
    options: 'http://localhost/hello',
    response: function(ctx, res) {
      if (res.hello !== 'world') {
        throw new Error('Failed to validate response');
      }
    }
  }
```

The `res` argument is an [```http.IncommingMessage```](https://nodejs.org/api/http.html#http_http_incomingmessage). Any errors thrown here will be recorded and cause the step to fail.

It is also possible to specify a custom `timeout` for the request -

```js
  {
    type: 'request',
    timeout: 1000, // ms
    options: 'http://localhost/hello'
  }
```

If not specified a default value of 60 seconds will be used.

`type: 'wait'`

A `wait` step causes the journey to pause for the specified `duration` of milliseconds -

```js
  {
    type: 'wait',
    duration: 100
  }
```

`duration` also accepts a function -

```js
  {
    type: 'wait',
    duration: function(ctx) {
      return ctx.stepIndex * 100;
    }
  }
```

`type: 'custom'`

A `custom` step simply calls the configured handler -

```js
  {
    type: 'custom',
    handler: function(ctx) {
      // do something
    }
  }
```

Any errors thrown here will be recorded and cause the step to fail.

Also supports async operation if a second argument is specified by the handler. In this case errors should be specified as the argument to the callback.

`ctx`

`ctx` is an object unique to each simulated user which can be used to store values between steps or functions within a step. The following properties are automatically added -

* `uuid` - a RFC4122 v4 UUID
* `index` - the index of the simulated user
* `stepIndex` - the index of the currently executing step
* `step` - the currently executing step (i.e. `ctx.steps[ctx.stepIndex]`)
* `deltas` - an array of timing results for the steps completed so far

Other supported types are `wait` and `custom`, see the code (`src/handlers`) for usage.

### Log serializers

[Bunyan](https://github.com/trentm/node-bunyan) is used for logging. You can add your own [serializers](https://github.com/trentm/node-bunyan#serializers) to modify the log output, this is particularly useful with the `context` field.

The serializers should be specified as a JS module which exports an object of serializers, where the keys are the log record field names and the values are the serializing functions (see [`test/exampleSerializer.js`](https://github.com/chrisprice/node-stressful-journey/blob/master/test/exampleSerializer.js) for an example).

## Running

Once you have a journey defined, you can run the stress test using -

```
stressful-journey journey.js [log serializer(s)] [count=1] [delay=0] [randomisation=0]
```

* `count` - the number of users to simulate
* `delay`/`ransomisation` - allows control of ramp-up `(1 - Math.random() * randomisation) * delay`
