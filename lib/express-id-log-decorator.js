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

const defaultFunctions = ['log', 'info', 'debug', 'error', 'warn'];

function defaultFormat(rid) {
    return `[${rid}]`;
}

module.exports = {
    decorate({
        logger,
        attribute = 'rid',
        format = defaultFormat,
        functions = defaultFunctions
    } = {}) {
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

        functions.forEach(f => logger[f] && (logger[f] = logRidDecorator(logger[f])));
    }
}