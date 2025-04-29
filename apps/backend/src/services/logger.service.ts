import {
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor(private context: string = 'App') {
    this.logger = new Logger(context);
  }

  log(message: string, context?: string) {
    this.logger.log(message, context || this.context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context || this.context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context || this.context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context || this.context);
  }
}
