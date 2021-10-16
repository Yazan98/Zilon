import { LibraryUpdateModel } from "../models/LibraryUpdateModel";
import { App } from "@slack/bolt";
import { ApplicationConfigFile } from "../models/ApplicationConfigFile";

/**
 * This Messaging Manager is the Class that will take Care of Slack Integration
 * In the Future if Discord will be Supported Should be Enabled or Disabled in this Class Only
 * Other Parts of the Project is not Responsible on this Change
 *
 * This Class just take the Ready Data to be Sent to Slack
 * The Slack Configuration is Enabled from config.json File
 * This File has App Token, Channel id to Send Messages on
 */
export class MessagingManager {

  private static CONFIG_FILE = "config.json";
  private static FIREBASE_KEY = "firebase";

  // Hardcoded Links
  private static FIREBASE_BASE_URL_DOCUMENTATION = "https://firebase.google.com/docs";
  private static RELEASE_NOTES_FIREBASE = "https://firebase.google.com/support/release-notes/android";

  /**
   * This Method will be Triggered when any Library has Update Will Take all of them
   * And Send them Via Messages on Slack Channel Configured from Config.json File
   * @param libraries
   */
  public sendMessageUpdateDependencies(libraries: Array<LibraryUpdateModel>) {
    let configFile = new ApplicationConfigFile("", "", "", true);
    const fs = require("fs");
    const data = fs.readFileSync(MessagingManager.CONFIG_FILE, 'utf8');
    configFile = JSON.parse(data)
    for (let i = 0; i < libraries.length; i++) {
      const library = libraries[i]
      let message = "";
      if (library.isGithubSource) {
        message += MessagingManager.getGithubMessageString(library);
      } else {
        message += MessagingManager.getMessageString(library);
      }
      MessagingManager.sendSlackMessage(configFile, message)
    }
  }

  /**
   * This Just an Message to Send it on General Channel Only
   * That the Cron Job is Started ... Logging xD
   */
  public sendCronJobStartEvent() {
    let configFile = new ApplicationConfigFile("", "", "", true);
    const fs = require("fs");
    const data = fs.readFileSync(MessagingManager.CONFIG_FILE, 'utf8');
    configFile = JSON.parse(data)

    configFile.channelId = "#general"
    MessagingManager.sendSlackMessage(configFile, "Zilon Scheduler Started To Check All Libraries ...")
  }

  /**
   * Github is Not Like Google Maven Repository
   * it Doesn't Depends on Specific Framework or Platform
   * The Message should be Something General to All of them
   * @param library
   * @private
   */
  private static getGithubMessageString(library: LibraryUpdateModel): string {
    let message = "";
    message += "*" + MessagingManager.capitalizeFirstLetter(library.name) + " Released New Version *\n"
    message += " 1. Library Releases Link : " + library.releaseUrl + " \n"
    message += " 2. Library Url : " + library.url + " \n"
    message += " 3. Library Version : " + library.version + " \n"

    return message
  }

  /**
   * This Message will be Sent only on Google Maven Repository Changed any Library
   * This Libraries is Working just on Android and Especially Androidx
   * For this Reason We Can get the Dependency Information on each Artifact
   * @param library
   * @private
   */
  private static getMessageString(library: LibraryUpdateModel): string {
    let isPlugin = false;
    let message = "";
    if (library.artifact.includes("plugin")) {
      isPlugin = true
    }
    message += "*" + MessagingManager.capitalizeFirstLetter(library.artifact.split("-").join(" ")) + " Released New Version *\n"
    message += " 1. New Version : " + library.version + "\n"
    if (isPlugin) {
      message += " 2. Update Plugin : " + "classpath (\'" + library.groupId + ":" + library.artifact + ":" + library.version + "\')" + "\n"
    } else {
      message += " 2. Update Dependency : " + "implementation \'" + library.groupId + ":" + library.artifact + ":" + library.version + "\'" + "\n"
    }

    if (library.groupId.includes(MessagingManager.FIREBASE_KEY)) {
      message += " 3. Documentation : " + MessagingManager.getFirebaseDocumentationUrl(library.artifact) + "\n";
      message += " 4. Release Notes : " + MessagingManager.RELEASE_NOTES_FIREBASE + "\n";
    }

    return message
  }

  private static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private static sendSlackMessage(configFile: ApplicationConfigFile, message: string) {
    try {
      MessagingManager.getSlackApplicationInstance(configFile.signingSecret, configFile.token).client.chat.postMessage({
        channel: configFile.channelId,
        mrkdwn: true,
        text: message,
        as_user: true,
        parse: 'full',
        username: 'Zilon'
      }).then((response) => {
        console.log("Slack Message Response : " + response.message.text);
      }).catch((exception) => {
        console.error(exception);
      })
    } catch (error) {
      console.error(error);
    }
  }

  private static getFirebaseDocumentationUrl(artifact: string): string {
    if (artifact.includes("firestore")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/firestore"
    } else if (artifact.includes("crashlytics")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/crashlytics"
    } else if (artifact.includes("analytics")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/analytics"
    } else if (artifact.includes("ads")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/ads"
    } else if (artifact.includes("appindexing")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/appindexing"
    } else if (artifact.includes("auth")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/auth"
    } else if (artifact.includes("config")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/config"
    } else if (artifact.includes("database")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/database"
    } else if (artifact.includes("dynamic-links")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/dynamic-links"
    } else if (artifact.includes("functions")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/functions"
    } else if (artifact.includes("invites")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/invites"
    } else if (artifact.includes("messaging")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/messaging"
    } else if (artifact.includes("storage")) {
      return MessagingManager.FIREBASE_BASE_URL_DOCUMENTATION + "/storage"
    } else {
      return "UnKnown"
    }
  }

  private static getSlackApplicationInstance(signingSecrete: string, token: string): App {
    return new App({
      signingSecret: signingSecrete,
      token: token,
    });
  }

}
