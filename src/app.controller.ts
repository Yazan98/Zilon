import { Controller, Get, Post } from "@nestjs/common";
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

  @Get("/google/deps")
  getAllDependencies(): string {
    new GoogleDependenciesManager().getAllPackages();
    return 'Check Logs of The Project ...';
  }

  @Post("/github/cache")
  createGithubCacheFile(): string {
    new GithubDependenciesManager().createGithubCacheFileForAllRepositories().then(() => {
      console.log("Anything ... from GithubDependenciesManager")
    }).catch((exception) => {
      console.error(exception)
    });
    return "Cached File Created !!!";
  }

  @Get("/github")
  getAllDependenciesGithub(): string {
    new GithubDependenciesManager().validateGithubLibrariesFile().then(() => {
      console.log("Anything ... from GithubDependenciesManager")
    }).catch((exception) => {
      console.error(exception)
    });
    return "Github Deps Returned ...";
  }

  @Get("/messages/test")
  sendMessageTest(): string {
    const items = new Array<LibraryUpdateModel>();
    items.push({
      groupId: "com.google.firebase",
      artifact: "firebase-analytics-ktx",
      version: "19.0.2",
      name: "",
      isGithubSource: false,
      releaseUrl: "",
      url: ""
    })

    items.push({
      groupId: "android.arch.paging",
      artifact: "runtime",
      version: "1.0.0",
      name: "",
      isGithubSource: false,
      releaseUrl: "",
      url: ""
    })

    items.push({
      isGithubSource: true,
      releaseUrl: "https://github.com/" + "nestjs/nest" + "/releases",
      version: "v8.0.0",
      url: "https://github.com/" + "nestjs/nest",
      artifact: "",
      groupId: "",
      name: "nest"
    })

    items.push({
      groupId: "android.arch.navigation",
      artifact: "navigation-common",
      version: "1.0.0",
      name: "",
      isGithubSource: false,
      releaseUrl: "",
      url: ""
    })

    new MessagingManager().sendMessageUpdateDependencies(items);
    return "Message Sent";
  }

}
