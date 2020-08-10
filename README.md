## express-id-log-decorator

A logger decorator to log request id on each log output.

**express-id-log-decorator** checks the http context, using the [express-http-context](https://www.npmjs.com/package/express-http-context) module, to get the request id to log.
 
If the requestId is not present in the request, the log message will remain unchanged.

### Contents
* [Installation](#installation)
* [Http context and Request ID](#http-context-and-request-id)
* [Request ID attribute name](#request-id-attribute-name)
* [Decorator](#decorator)
* [Functions](#functions)
* [Request ID substring format in log line](#request-id-substring-format-in-log-line)
* [Options](#options)

#### Installation
```bash
npm install express-id-log-decorator
```

#### Http context and Request ID
You need to initialize and use the _express-http-context_ middleware in your application.
To generate and add request id for your app, you can use any middleware you want, but you have to set this request id in the http context.
So, if you want, you can use the [express-ruid](https://www.npmjs.com/package/express-ruid) package which will add the generated request id in the Express req object and in your http context for you, as in the following example:

```js
const express = require('express');
const ruid = require('express-ruid');
const httpContext = require('express-http-context');

const app = express();
...
...
app.use(httpContext.middleware);
app.use(ruid{ setInContext: true });
```

#### Request ID attribute name
The decorator will search in context the default *'rid'* attribute.
If you confiure the _express-ruid_ to use a custom request id attribute name, or if you use a different request id middleware and you set by hand the request id in the context with a different name than 'rid', than you have to configure the _attribute_ options when you apply the decorator:
```js
const express = require('express');
const ruid = require('express-ruid');
const httpContext = require('express-http-context');
const idLogDecorator = require('./logger/log-rid-decorator');

const app = express();
...
...
app.use(httpContext.middleware);
app.use(ruid{ setInContext: true, attribute: 'requestId' });
...
...
// the Decorator will search for 'requestId' instead of 'rid'
idLogDecorator.decorate({ logger: theLogger, attribute: 'requestId' });

```

#### Decorator
To get your id logged into each log line, you can just decorate your logger functions with the _express-id-log-decorator_ ```decorate(options = {})``` function.
As an example, using Winston logger:
```js
const winston = require('winston');
const winstonLogger = winston.createLogger();
const idLogDecorator = require('./logger/log-rid-decorator');
...
...
winstonLogger.add(new winston.transport.Console({
    format: new winston.transports.simple({
        level: 'info'
    })
}));

idLogDecorator.decorate({ logger: winstonLogger });
```

Now you will have your logger functions decorated and able to log the request id as message prefix.

#### Functions
By default, the decorator will be applied to the following logger functions:
* ```log()```
* ```debug()```
* ```error()```
* ```warn()``` 

as specified by the internal array ```defaultFunctions```:
```js
const defaultFunctions = [
    'log',
    'info',
    'debug',
    'error',
    'warn'
];
```

If you want to change the functions to decorate you can configure the ```functions``` options when you apply the decoration:
```js
const idLogDecorator = require('./logger/log-rid-decorator');
...
...
...
// if you want the request id only in production for 'info' and 'error'
idLogDecorator.decorate({ logger: theLogger, functions: ['info', 'error'] });
```

#### Request ID substring format in log line
You can specify how to format the request id sub-string in the log line, configuring the ```format``` option with a custom function.
For example you can specify to print the id using color, or you can specify some prefix and suffix.
Here are some exaples:
```js
const idLogDecorator = require('./logger/log-rid-decorator');
...
...
...
// to log the request id in green color
idLogDecorator.decorate({
    logger: theLogger,
    format: (rid) => chalk.green(`${rid}`)
});

// to log whatever you want before and after
idLogDecorator.decorate({
    logger: theLogger,
    format: function (rid) {
        return `SOMETHING BEFORE ${rid} AND OTHER AFTER`;
    }
});
```

The default output is ````[${rid}]```` as defined by the internal ```defaultFormat()``` function:
```js
function defaultFormat(rid) {
    return `[${rid}]`;
}
```

#### Options
```decorate()``` supports the following options:
* **logger**: (_object_) the logger object with logging functions to decorated
* **attribute**: (_string_) to specify the attribute name to search for in the Http Context
* **format**: (_function_) which accept the requestId and return a formatted string
* **functions** (_array<string>_) array of name of the functions to decorate

### License

express-id-log-decorator is [MIT licensed](LICENSE).