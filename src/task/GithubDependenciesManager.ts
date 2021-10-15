import {
  GithubCacheLibrary,
  GithubContainerFileContent,
  GithubLibrariesCacheContainer,
  GithubLibrary
} from "../models/GithubLibrary";

export class GithubDependenciesManager {

  private static GITHUB_LIBRARIES_FILE = "github-libraries.json";
  private static CONSOLE_LOGGING_KEY = "[Github Dependencies Manager]"
  private static GITHUB_CACHE_FILE = "github-libraries-cache.json"

  /**
   * Main Method to Start inside This Manager
   * 1. Create and Validate the Local Json Files
   * 2. Start Validating The Old Files if Exists, if Not Will Create Default Files
   * 3. Will loop on all of them to see if the current version on github is similar to cached version
   * if not will send message on slack channel via config.json token, channelId
   */
  public validateGithubLibrariesFile() {
    const fs = require('fs');
    this.createGithubLibrariesFile();

    let librariesFile = new GithubContainerFileContent(new Array<GithubLibrary>())
    if (fs.existsSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE)) {
      const data = fs.readFileSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE, 'utf8');
      librariesFile = JSON.parse(data)

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
    const fs = require('fs');
    if (!fs.existsSync(GithubDependenciesManager.GITHUB_CACHE_FILE)) {
      const librariesFile = new GithubLibrariesCacheContainer(new Array<GithubCacheLibrary>())
      librariesFile.libraries.push({
        name: "demo",
        release: "Release Version"
      })

      const json = JSON.stringify(librariesFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_CACHE_FILE, json, 'utf8', (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }

    if (!fs.existsSync(GithubDependenciesManager.GITHUB_LIBRARIES_FILE)) {
      const librariesFile = new GithubContainerFileContent(new Array<GithubLibrary>())
      librariesFile.libraries.push({
        name: "Zilon",
        url: "Yazan98/Zilon"
      })

      const json = JSON.stringify(librariesFile, null, "\t");
      fs.writeFile(GithubDependenciesManager.GITHUB_LIBRARIES_FILE, json, 'utf8', (exception) => {
        if (exception != null) {
          console.error(GithubDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
        }
      });
    }
  }

}