import { NetworkInstance } from "./NetworkInstance";
import { GoogleMavenArtifact, GoogleMavenLibrary } from "../models/GoogleMavenLibrary";
import { timer } from "rxjs";

export class GoogleDependenciesManager {

  private static CONSOLE_LOGGING_KEY = "[Google Dependencies]";
  private static SKIP_META_DATA_TAG = "metadata";
  private static SKIP_XML_HEADER_TAG = "xml version='1.0'";

  /**
   * This Method is The Start Point To Get All Packages From Google Maven Repository
   * This Request Will Return Xml Response With All Packages In Google Repository For Android Development
   * The Script Will Split them Via New Line to Loop On Each Line And Read The Value inside Xml Tag to get Group Id
   */
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

  /**
   * This Method Will Loop on All Packages Returned from getAllPackages() To Filter The Packages and Remove Un Used Lines
   * To Get Just Groups id's
   * Then Will get All Artifacts and Versions for Each Group Id Via getLibrariesVersions()
   * @param response
   * @private
   */
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

  /**
   * This Method Will Loop on All Groups To Get All Artifacts and Versions of the Group Id
   * And Filter Them Then Add Them to Filtered Array With (GroupId, Artifacts, Versions)
   * @param libraries
   * @private
   */
  private async getLibrariesVersions(libraries: Array<string>) {
    if (libraries == null) {
      return
    }

    let librariesArray: Array<GoogleMavenLibrary> = new Array<GoogleMavenLibrary>();
    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Start Getting Libraries Versions ===================================");
    for (let i = 0; i < libraries.length; i++) {
      if (libraries[i] === "") {
        continue;
      }

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

    this.validateLibrariesUpdatedVersions(librariesArray);
    console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " End Getting Libraries Versions ===================================");
  }

  /**
   * Artifacts Names and Versions Returned in Same Xml File
   * Need To Split all of Them and Remove UnNessessary Lines
   * Then Filter All of them to return Artifacts Returned From Group Id
   * @param response
   * @private
   */
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

  /**
   * Here is the Last Point from Google Maven Repositories Libraries
   * After Loop on all of them to get All Artifacts, Versions of Artifacts
   * Will Start Validating Via Cached Versions in Last Update Inside Saved Json File
   *
   * Will check If the File is not Exists Will Push All Messages to Slack Channel with The Latest Versions of Each Group
   * If the Json File Exists, Will Check The Cached Version of Each Library and if the Library Has new Version Will Send Slack Message
   * With Provided Application Token in Json File Too
   * @param librariesArray
   * @private
   */
  private validateLibrariesUpdatedVersions(librariesArray: Array<GoogleMavenLibrary>) {
    for (let i = 0; i < librariesArray.length; i++) {

    }
  }

}
