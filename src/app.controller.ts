import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GoogleDependenciesManager } from "./task/GoogleDependenciesManager";
import { MessagingManager } from "./task/MessagingManager";
import { LibraryUpdateModel } from "./models/LibraryUpdateModel";
import { GithubDependenciesManager } from "./task/GithubDependenciesManager";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/deps")
  getAllDependencies(): string {
    new GoogleDependenciesManager().getAllPackages();
    return 'Check Logs of The Project ...';
  }

  @Get("/github")
  getAllDependenciesGithub(): string {
    new GithubDependenciesManager().validateGithubLibrariesFile();
    return "Github Deps Returned ...";
  }

  @Get("/messages/test")
  sendMessageTest(): string {
    const items = new Array<LibraryUpdateModel>();
    items.push({
      groupId: "com.google.firebase",
      artifact: "firebase-analytics-ktx",
      version: "19.0.2"
    })

    items.push({
      groupId: "android.arch.paging",
      artifact: "runtime",
      version: "1.0.0"
    })

    items.push({
      groupId: "android.arch.navigation",
      artifact: "navigation-common",
      version: "1.0.0"
    })

    new MessagingManager().sendMessageUpdateDependencies(items);
    return "Message Sent";
  }

}
