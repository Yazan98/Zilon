import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessagingManager } from "./MessagingManager";
import { GoogleDependenciesManager } from "./GoogleDependenciesManager";
import { GithubDependenciesManager } from "./GithubDependenciesManager";

@Injectable()
export class TasksService {

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'dependencies',
  })
  handleCron() {
    new MessagingManager().sendCronJobStartEvent();
    new GoogleDependenciesManager().getAllPackages();
    new GithubDependenciesManager().validateGithubLibrariesFile().then(() => {
      console.log("Anything ... from GithubDependenciesManager")
    }).catch((exception) => {
      console.error(exception)
    });
  }

}
