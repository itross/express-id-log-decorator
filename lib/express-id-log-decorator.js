/*!
 * express-id-log-decorator
 * Express.js Request Unique ID logger decorator
 *
 * Copyright(c) 2020 Luca Stasio <joshuagame@gmail.com>, IT Resources s.r.l. <http://www.itresources.it>
 *
 * Use of this source code is governed by a MIT license.
 * You can find the MIT license terms for this source code in the LICENSE file.
 *
 * lib/express-id-log-decorator.js
 */

const httpContext = require('express-http-context');

const defaultFunctions = [
    'log',
    'info',
    'debug',
    'error',
    'warn'
];

function defaultFormat(rid = 'undefined-rid') {
    return `[${rid}]`;
}

module.exports = {
    decorate({
        logger,
        attribute = 'rid',
        format = defaultFormat,
        functions = defaultFunctions
    } = {}) {
        if (typeof format !== 'function') {
            throw new Error(`the "format" option must be a function. You passed in a ${typeof format}.`);
        }

        if (typeof functions !== 'string' && !Array.isArray(functions)) {
            throw new Error(`the "functions" option must be a string or an array. You passed in a ${typeof functions}.`);
        }

        const logRidDecorator = (wrapped) => {
            return function () {
                const rid = httpContext.get(attribute);

                if (rid) {
                    // we get last idx, the message, leaving other as is
                    const idx = arguments.length - 1;
                    arguments[idx] = `${format(rid)} - ${arguments[idx]}`;
                }

                wrapped.apply(this, arguments);
            }
        }

        const applyDecorator = (f) => {
            logger[f] && (logger[f] = logRidDecorator(logger[f]))
        }

        typeof functions === 'string' ?
            applyDecorator(functions) :
            functions.forEach(f => applyDecorator(f));

    }
}