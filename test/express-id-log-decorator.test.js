/*!
 * express-id-log-decorator
 * Express.js Request Unique ID logger decorator
 *
 * Copyright(c) 2020 Luca Stasio <joshuagame@gmail.com>, IT Resources s.r.l. <http://www.itresources.it>
 *
 * Use of this source code is governed by a MIT license.
 * You can find the MIT license terms for this source code in the LICENSE file.
 *
 * test/express-id-log-decorator.test.js
 */

const idLogDecorator = require('../lib/express-id-log-decorator');
const supertest = require('supertest');
const express = require('express');
const ruid = require('express-ruid');
const winston = require('winston');
require('@chrisalderson/winston-spy');
const sinon = require('sinon');
const httpContext = require('express-http-context');

describe('decorate() options', function () {
    it('should get an error for bad "format" option', function (done) {
        const logger = winston.createLogger();
        let passed = false;
        try {
            idLogDecorator.decorate({
                logger,
                format: 'this-will-generate-a-type-error'
            });
            console.log('we expected a type error for "format" options');
        } catch (err) {
            passed = true;
            done();
        }

        expect(passed).toBe(true);

    });

    it('should get an error for bad "functions" option', function (done) {
        const logger = winston.createLogger();
        let passed = false;
        try {
            idLogDecorator.decorate({
                logger,
                functions: 12
            });
            console.log('we expected a type error for "functions" options');
        } catch (err) {
            passed = true;
            done();
        }

        expect(passed).toBe(true);

    });
});

describe('request id in log output', function () {

    it('should have request id in logger.info output', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'info' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({ logger });
        const app = express();
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            const msg = 'test INFO message';
            logger.info(msg);
            expect(spy.calledOnce).toBe(true);
            const rid = httpContext.get('rid');
            expect(spy.calledWith({ level: 'info', message: `[${rid}] - ${msg}` })).toBe(true);
            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

    it('should have request id only in logger.info output', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'info' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({ logger, functions: 'info' });
        const app = express();
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            const msg = 'test INFO message';
            logger.info(msg);
            expect(spy.calledOnce).toBe(true);
            const rid = httpContext.get('rid');
            expect(spy.calledWith({ level: 'info', message: `[${rid}] - ${msg}` })).toBe(true);
            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

    it('should have request id in logger.debug output', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'debug' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({ logger });
        const app = express();
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            try {
                const msg = 'test DEBUG message';
                logger.debug(msg);
                expect(spy.calledOnce).toBe(true);
                const rid = httpContext.get('rid');
                expect(spy.calledWith({ level: 'debug', message: `[${rid}] - ${msg}` })).toBe(true);
            } catch (err) {
                console.error(err);
            }

            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

});

describe('log output without request id', function () {
    it('should have logger.info output without request id', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'info' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({ logger });
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            const msg = 'test INFO message';
            logger.info(msg);
            expect(spy.calledOnce).toBe(true);
            const rid = httpContext.get('rid');
            expect(spy.calledWith({ level: 'info', message: msg })).toBe(true);
            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

    it('should have logger.debug output without request id', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'debug' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({ logger });
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            try {
                const msg = 'test DEBUG message';
                logger.debug(msg);
                expect(spy.calledOnce).toBe(true);
                const rid = httpContext.get('rid');
                expect(spy.calledWith({ level: 'debug', message: msg })).toBe(true);
            } catch (err) {
                console.error(err);
            }

            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });
});

describe('request id in log output with custom format', function () {

    it('should have request id in logger.info output', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'info' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({
            logger,
            format: (rid) => {
                return `request-id: ${rid}`;
            }
        });
        const app = express();
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            const msg = 'test INFO message';
            logger.info(msg);
            expect(spy.calledOnce).toBe(true);
            const rid = httpContext.get('rid');
            expect(spy.calledWith({ level: 'info', message: `request-id: ${rid} - ${msg}` })).toBe(true);
            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

    it('should have request id in logger.debug output', function (done) {
        const spy = sinon.spy();
        const consoleTransport = new winston.transports.Console({ silent: true });
        const spyTransport = new winston.transports.SpyTransport({ spy, level: 'debug' });
        const logger = winston.createLogger();
        logger.add(consoleTransport);
        logger.add(spyTransport);
        idLogDecorator.decorate({
            logger,
            format: function (rid) {
                return `request-id: ${rid}`;
            }
        });
        const app = express();
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            try {
                const msg = 'test DEBUG message';
                logger.debug(msg);
                expect(spy.calledOnce).toBe(true);
                const rid = httpContext.get('rid');
                expect(spy.calledWith({ level: 'debug', message: `request-id: ${rid} - ${msg}` })).toBe(true);
            } catch (err) {
                console.error(err);
            }

            res.sendStatus(200);
        });

        supertest(app).get('/').expect(200).end(err => done());
    });

});