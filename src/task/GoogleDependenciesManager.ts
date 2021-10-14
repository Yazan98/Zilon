import { NetworkInstance } from "./NetworkInstance";
import { GoogleMavenArtifact, GoogleMavenLibrary } from "../models/GoogleMavenLibrary";
import { timer } from "rxjs";

export class GoogleDependenciesManager {

  private static CONSOLE_LOGGING_KEY = "[Google Dependencies]";
  private static SKIP_META_DATA_TAG = "metadata";
  private static SKIP_XML_HEADER_TAG = "xml version='1.0'";

  public getAllPackages() {
    NetworkInstance.getGoogleMavenRepositoriesInstance().get(NetworkInstance.ANDROID_MAVEN_PATH + NetworkInstance.ANDROID_ALL_LIBRARIES, {
      method: "get"
    }).then((response) => {
      console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY, " Response : " + response.data + " Request : " + response.config.url);
      this.validatePackagesResponse(response.data.toString()).catch((exception) => {
        console.error(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
      });
    }).catch((exception) => {
      console.error(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
    });
  }

  private async validatePackagesResponse(response: string) {
    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Start Validating Response ===================================");
    let librariesArray: Array<string> = new Array<string>();
    const responseValue = response.split("\n");
    for (let i = 0; i < responseValue.length; i++) {
      if (!responseValue[i].includes(GoogleDependenciesManager.SKIP_XML_HEADER_TAG) && !responseValue[i].includes(GoogleDependenciesManager.SKIP_META_DATA_TAG)) {
        const targetValue = responseValue[i].replace("<", "").replace("/>", "");
        console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Library : " + targetValue);
        librariesArray.push(targetValue)
      }
    }

    await this.getLibrariesVersions(librariesArray);
    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " End Validating Response ===================================");
  }

  private async getLibrariesVersions(libraries: Array<string>) {
    if (libraries == null) {
      return
    }

    let librariesArray: Array<GoogleMavenLibrary> = new Array<GoogleMavenLibrary>();
    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Start Getting Libraries Versions ===================================");
    for (let i = 0; i < libraries.length; i++) {
      await timer(1000)
      console.log("Start Validating Group Index For Path : " + libraries[i])
      await NetworkInstance.getGoogleMavenRepositoriesInstance().get(NetworkInstance.ANDROID_MAVEN_PATH + libraries[i].split(".").join("/").trim() + NetworkInstance.GROUP_ARTIFACTS, {
        method: "get"
      }).then((response) => {
        const artifacts = this.getArtifactsByGroupRequest(response.data.toString().split("\n"))
        librariesArray.push({
          groupId: libraries[i],
          artifacts: artifacts
        })
      }).catch((exception) => {
        console.error(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
      })
    }

    for (let i = 0; i < librariesArray.length; i++) {
      const library = librariesArray[i]
      console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Library Information : " + library.groupId + " : Artifacts : " + library.artifacts.toString())
    }

    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " End Getting Libraries Versions ===================================");
  }

  private getArtifactsByGroupRequest(response: Array<string>): Array<GoogleMavenArtifact> {
    let artifacts = Array<GoogleMavenArtifact>()
    for (let i = 0; i < response.length; i++) {
      if (i == 0 || i == 1 || i == response.length - 2 || response[i] === "") {
        continue;
      }

      const libraryInfo = response[i].trim()
      const artifactName = libraryInfo.split(" ")[0].replace("<", "")
      const versions = libraryInfo.split("=\"")[1]
      artifacts.push({
        name: artifactName,
        versions: versions.replace("\"/>", "").split(",")
      })
    }
    return artifacts
  }

}
