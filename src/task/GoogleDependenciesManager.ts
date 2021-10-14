import { NetworkInstance } from "./NetworkInstance";


export class GoogleDependenciesManager {

  private static CONSOLE_LOGGING_KEY = "[Google Dependencies]";

  public getAllPackages() {
    NetworkInstance.getGoogleMavenRepositoriesInstance().get(NetworkInstance.ANDROID_MAVEN_PATH + NetworkInstance.ANDROID_ALL_LIBRARIES, {
      method: 'get'
    }).then((response) => {
      console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY, " Response : " + response.data + " Request : " + response.config.url);
    }).catch((exception) => {
      console.error(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Exception : " + exception);
    }).finally(() => {
      console.log(GoogleDependenciesManager.CONSOLE_LOGGING_KEY + " Get All Packages Finished the Task");
    })
  }

}