import winston from 'winston';
import logger from '../../../../website/server/libs/logger';
import {
  NotFound,
} from '../../../../website/server/libs/errors';

describe.only('logger', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = sandbox.stub(Object.getPrototypeOf(winston.createLogger()), 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('info', () => {
    it('calls winston\'s info log', () => {
      logger.info(1, 2, 3);
      expect(logSpy).to.be.calledOnce;
      expect(logSpy).to.be.calledWith('info', 1, 2, 3);
    });
  });

  describe('error', () => {
    context('non-error object', () => {
      it('passes through arguments if the first arg is not an error object', () => {
        logger.error(1, 2, 3, 4);
        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith('error', 1, 2, 3, 4);
      });
    });

    context('error object', () => {
      it('logs the stack and the err data', () => {
        const errInstance = new Error('An error.');
        logger.error(errInstance, {
          data: 1,
        }, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          { data: 1, fullError: errInstance },
          2,
          3,
        );
      });

      it('logs the stack and the err data with it\'s own fullError property', () => {
        const errInstance = new Error('An error.');
        const anotherError = new Error('another error');

        logger.error(errInstance, {
          data: 1,
          fullError: anotherError,
        }, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          { data: 1, fullError: anotherError },
          2,
          3,
        );
      });

      it('logs the error when errorData is null', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, null, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          null,
          2,
          3,
        );
      });

      it('logs the error when errorData is not an object', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, true, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          true,
          2,
          3,
        );
      });

      it('logs the error when errorData does not include isHandledError property', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, { httpCode: 400 }, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          { httpCode: 400, fullError: errInstance },
          2,
          3,
        );
      });

      it('logs the error when errorData includes isHandledError property but is a 500 error', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, {
          isHandledError: true,
          httpCode: 502,
        }, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          { httpCode: 502, isHandledError: true, fullError: errInstance },
          2,
          3,
        );
      });

      it('logs a warning when errorData includes isHandledError property and is not a 500 error', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, {
          isHandledError: true,
          httpCode: 403,
        }, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'warn',
          errInstance.stack,
          { httpCode: 403, isHandledError: true, fullError: errInstance },
          2,
          3,
        );
      });

      it('logs additional data from a CustomError', () => {
        const errInstance = new NotFound('An error.');

        errInstance.customField = 'Some interesting data';

        logger.error(errInstance, {}, 2, 3);

        expect(logSpy).to.be.calledOnce;
        expect(logSpy).to.be.calledWith(
          'error',
          errInstance.stack,
          {
            fullError: {
              customField: 'Some interesting data',
            },
          },
          2,
          3,
        );
      });
    });
  });
});
