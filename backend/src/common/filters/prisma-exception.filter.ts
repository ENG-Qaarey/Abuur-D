import {
  Catch,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';

const MAPPING: Record<string, { status: HttpStatus; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'A record with this value already exists' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'This record is linked to other records and cannot be changed this way',
  },
  P2034: { status: HttpStatus.CONFLICT, message: 'Concurrent update, please retry' },
};

/** Maps known Prisma errors to clean HTTP responses without leaking internals. */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();

    // A query the client shaped badly (e.g. an out-of-range value that slipped
    // past the DTO). The Prisma message names internals, so it is not returned.
    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(`Rejected invalid query: ${exception.message.split('\n').at(-1)}`);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid request',
      });
      return;
    }

    const mapped = MAPPING[exception.code];

    if (!mapped) {
      this.logger.error(`Unhandled Prisma error ${exception.code}`, exception.stack);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
      return;
    }

    const body: Record<string, unknown> = {
      statusCode: mapped.status,
      message: mapped.message,
    };
    if (exception.code === 'P2002' && exception.meta?.target) {
      body.fields = exception.meta.target;
    }
    response.status(mapped.status).json(body);
  }
}
