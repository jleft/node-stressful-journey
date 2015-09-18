# node-stressful-journey
A tool for stess testing user journeys through APIs

## Usage

```
npm install -g stressful-journey
```

To execute a stress test, you need to provide the journey to test. This is specified as a JS module which exports an array of steps.

The most common step is a request -

```js
  {
    type: 'request',
    options: 'http://localhost/hello'
  }
```

The ```options``` value is passed to ```http.request``` ([docs](https://nodejs.org/api/http.html#http_http_request_options_callback)). N.B. ```options.agent``` will always be set to false to prevent connection pooling.

It is also possible to specify a factory method if you want to e.g. template the URL -

```js
  var prefifx = ''http://localhost/hello';
  // ...
  options: function(ctx) {
    return prefix + '/hello';
  }
```

The function will be called once per simulated user per run. The `ctx` argument is an object unique to each simulated user which can be used to store values between calls. Additionally it contains the following properties are automatically added -

* `index` - the index of the simulated user
* `stepIndex` - the index of the currently executing step
* `step` - the currently executing step (i.e. `ctx.steps[ctx.stepIndex]`)
* `steps` - the full array of journey steps
* `deltas` - an array of timing results for the steps completed so far

Other supported types are `wait` and `custom`, see the code (`src/handlers`) for usage.

Once you have a journey defined, you can run the stress test using -

```
stressful-journey journey.js [count=1] [delay=0] [randomisation=0]
```

* `count` - the number of users to simulate
* `delay`/`ransomisation` - allows control of ramp-up `(1 - Math.random() * randomisation) * delay`
