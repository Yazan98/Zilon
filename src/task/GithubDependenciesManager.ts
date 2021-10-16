import {
  GithubCacheLibrary,
  GithubContainerFileContent,
  GithubLibrariesCacheContainer,
  GithubLibrary,
  GithubRepositoriesInformation,
  GithubRepositoryRelease
} from "../models/GithubLibrary";
import { NetworkInstance } from "./NetworkInstance";
import { timer } from "rxjs";
import { LibraryUpdateModel } from "../models/LibraryUpdateModel";
import { MessagingManager } from "./MessagingManager";
import { ApplicationConfigFile } from "../models/ApplicationConfigFile";

/**
 * This Github Manager Will Check all Repositories from Github Config Json File
 * And Request Github Api for each Repository to Get The Latest Release Only
 * if not Match the Cached Release Will send it on Slack as a new Version
 * And this Task will be Executed One time Per Day because of Limitation on Api Requests inside Github Client
 *
 * You Can Specify More Requests by adding clientId, SecreteClientToken inside Config.json File
 * If empty Will have the Default Limit
 * You can Create Them from Github Account Settings, OAuth Settings
 */
export class GithubDependenciesManager {

  private static GITHUB_LIBRARIES_FILE = "github-libraries.json";
  private static CONSOLE_LOGGING_KEY = "[Github Dependencies Manager]";
  private static GITHUB_CACHE_FILE = "github-libraries-cache.json";
  private static CONFIG_FILE = "config.json";

  /**
   * Main Method to Start inside This Manager
   * 1. Create and Validate the Local Json Files
   * 2. Start Validating The Old Files if Exists, if Not Will Create Default Files
   * 3. Will loop on all of them to see if the current version on github is similar to cached version
   * if not will send message on slack channel via config.json token, channelId
   */
  public async validateGithubLibrariesFile() {
    const fs = require("fs");
    this.createGithubLibrariesFile();

    let configFile = new ApplicationConfigFile("", "", "", true, "", "");
    if (fs.existsSync(GithubDependenciesManager.CONFIG_FILE)) {
      const dataFile = fs.readFileSync(GithubDependenciesManager.CONFIG_FILE);
      configFile = JSON.parse(dataFile.toString());
    }

    let librariesInformation = new Array<GithubRepositoriesInformation>();
    let librariesFile = new GithubContainerFileContent(new Array<GithubLibrary>());
    if (fs.existsSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE)) {
      const data = fs.readFileSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE, "utf8");
      librariesFile = JSON.parse(data);
      for (let i = 0; i < librariesFile.libraries.length; i++) {
        const library = librariesFile.libraries[i];
        await timer(5000);
        await NetworkInstance.getGithubRepositoriesInstance().get<Array<GithubRepositoryRelease>>(this.getGithubRequestUrl(configFile, NetworkInstance.GITHUB_REPOS_KEY + library.url + NetworkInstance.GITHUB_RELEASES_KEY), {
          method: "get"
        }).then((response) => {
          if (response.status == NetworkInstance.SUCCESS_RESPONSE_CODE) {
            librariesInformation.push({
              name: library.name,
              url: library.url,
              releases: response.data
            });
          } else {
            console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + response.data + " Response : " + response.statusText);
          }
        }).catch((exception) => {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        });
      }

      this.validateGithubRepositoriesReleasesVersions(librariesInformation);
    }
  }

  private getGithubRequestUrl(config: ApplicationConfigFile, url: string): string {
    return url + "?client_id=" + config.githubClientId + "&client_secret=" + config.githubClientSecrete;
  }

  /**
   * After Get all Releases From Github Api to Get All  Releases Information
   * We Will Validate the First Release With The Cached Versions if Not Equals
   * Will Send Slack Message with The New Version Triggered ...
   * @param libraries
   * @private
   */
  private validateGithubRepositoriesReleasesVersions(libraries: Array<GithubRepositoriesInformation>) {
    const fs = require("fs");
    let librariesFile = new GithubLibrariesCacheContainer(new Array<GithubCacheLibrary>());
    const requireUpdateLibraries = new Array<LibraryUpdateModel>();
    fs.readFile(GithubDependenciesManager.GITHUB_CACHE_FILE, "utf8", function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        librariesFile = JSON.parse(data);
        for (let i = 0; i < librariesFile.libraries.length; i++) {
          const cachedLibrary = librariesFile.libraries[i];
          for (let j = 0; j < libraries.length; j++) {
            const triggeredLibrary = libraries[j];
            if (cachedLibrary.name.includes(triggeredLibrary.name) && triggeredLibrary.releases != null) {
              if (!cachedLibrary.release.includes(triggeredLibrary.releases[triggeredLibrary.releases.length - 1].ref.replace("refs/tags/", ""))) {
                console.log(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Library Need Update : " + triggeredLibrary.name + " Version : " + cachedLibrary.release + " Updated Version : " + triggeredLibrary.releases[triggeredLibrary.releases.length - 1].ref.replace("refs/tags/", ""));
                requireUpdateLibraries.push({
                  isGithubSource: true,
                  releaseUrl: "https://github.com/" + triggeredLibrary.url + "/releases",
                  version: triggeredLibrary.releases[triggeredLibrary.releases.length - 1].ref.replace("refs/tags/", ""),
                  url: "https://github.com/" + triggeredLibrary.url,
                  artifact: "",
                  groupId: "",
                  name: triggeredLibrary.url.split("/")[1]
                });
              }
            }
          }
        }

        new MessagingManager().sendMessageUpdateDependencies(requireUpdateLibraries);
        GithubDependenciesManager.saveNewGithubRepositoriesCacheFile(libraries);
      }
    });
  }

  /**
   * After Updating the Required Dependencies and Send All of them inside Messages in Slack
   * Now we Want to Refresh the Json File with New Cached Data
   * To Save The Notified Releases
   * @param libraries
   * @private
   */
  private static saveNewGithubRepositoriesCacheFile(libraries: Array<GithubRepositoriesInformation>) {
    const fs = require("fs");
    if (fs.existsSync(GithubDependenciesManager.GITHUB_CACHE_FILE)) {
      const librariesFile = new GithubLibrariesCacheContainer(new Array<GithubCacheLibrary>());
      for (let i = 0; i < libraries.length; i++) {
        try {
          const library = libraries[i];
          librariesFile.libraries.push({
            name: library.name,
            release: library.releases[library.releases.length - 1].ref.replace("refs/tags/", "")
          });
        } catch (error) {
          console.error(error);
        }
      }

      const json = JSON.stringify(librariesFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_CACHE_FILE, json, "utf8", (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }
  }

  /**
   * Check if the Github Libraries File Not Exists, Create The Libraries Json File
   * If the Cached Libraries from Github Repos Not Found, Create Empty One
   *
   * This Will be First Condition inside this Manager to Manage Dependencies Before Start
   * @private
   */
  private createGithubLibrariesFile() {
    const fs = require("fs");
    if (!fs.existsSync(GithubDependenciesManager.GITHUB_CACHE_FILE)) {
      const librariesFile = new GithubLibrariesCacheContainer(new Array<GithubCacheLibrary>());
      librariesFile.libraries.push({
        name: "demo",
        release: "Release Version"
      });

      const json = JSON.stringify(librariesFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_CACHE_FILE, json, "utf8", (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }

    if (!fs.existsSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE)) {
      const librariesFile = new GithubContainerFileContent(new Array<GithubLibrary>());
      librariesFile.libraries.push({
        name: "Zilon",
        url: "Yazan98/Zilon"
      });

      const json = JSON.stringify(librariesFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_LIBRARIES_FILE, json, "utf8", (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }
  }

  /**
   * This Option is Available When you want To Make Snapshot of all releases on all Available Github Repositories
   * This Method Will read The Github Repositories One Time and Get all Latest Versions To Cache Them
   * Then Next Time The Cron Job will Check Each one of them if updated will Send Slack Message then Update The Cache File
   */
  public async createGithubCacheFileForAllRepositories() {
    const fs = require("fs");
    let librariesInformation = new Array<GithubRepositoriesInformation>();
    let librariesFile = new GithubContainerFileContent(new Array<GithubLibrary>());

    if (fs.existsSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE)) {
      const data = fs.readFileSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE, "utf8");
      librariesFile = JSON.parse(data);
      for (let i = 0; i < librariesFile.libraries.length; i++) {
        const library = librariesFile.libraries[i];
        await timer(3000);
        await NetworkInstance.getGithubRepositoriesInstance().get<Array<GithubRepositoryRelease>>(NetworkInstance.GITHUB_REPOS_KEY + library.url + NetworkInstance.GITHUB_RELEASES_KEY, {
          method: "get"
        }).then((response) => {
          if (response.status == NetworkInstance.SUCCESS_RESPONSE_CODE) {
            console.log(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Library : " + library.url + " Response : " + response.data.toString());
            librariesInformation.push({
              name: library.name,
              url: library.url,
              releases: response.data
            });
          } else {
            console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + response.data);
          }
        }).catch((exception) => {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        });
      }

      const librariesCacheFile = new GithubLibrariesCacheContainer(new Array<GithubCacheLibrary>());
      for (let i = 0; i < librariesInformation.length; i++) {
        try {
          const library = librariesInformation[i];
          librariesCacheFile.libraries.push({
            name: library.name,
            release: library.releases[library.releases.length - 1].ref.replace("refs/tags/", "")
          });
        } catch (error) {
          console.error(error);
        }
      }

      const json = JSON.stringify(librariesCacheFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_CACHE_FILE, json, "utf8", (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }
  }

}