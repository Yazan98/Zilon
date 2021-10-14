import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Timeout(500000)
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'dependencies',
  })
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
