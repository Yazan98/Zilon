import { LibraryUpdateModel } from "../models/LibraryUpdateModel";
import { App } from "@slack/bolt";
import { ApplicationConfigFile } from "../models/ApplicationConfigFile";

export class MessagingManager {

  private static CONFIG_FILE = "config.json";
  private static FIREBASE_KEY = "firebase";

  // Hardcoded Links
  private static FIREBASE_BASE_URL_DOCUMENTATION = "https://firebase.google.com/docs";
  private static RELEASE_NOTES_FIREBASE = "https://firebase.google.com/support/release-notes/android";

  public sendMessageUpdateDependencies(libraries: Array<LibraryUpdateModel>) {
    let configFile = new ApplicationConfigFile("", "", "");
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

  private static getGithubMessageString(library: LibraryUpdateModel): string {
    let message = "";
    message += "*" + MessagingManager.capitalizeFirstLetter(library.name) + " Released New Version *\n"
    message += " 1. Library Release Link : " + library.releaseUrl + " \n"
    message += " 2. Library Url : " + library.url + " \n"
    message += " 3. Library Version : " + library.version + " \n"
    if (library.isPreRelease) {
      message += " 4. This Release is a Sub Release"
    } else {
      message += " 5. This Release is a Full Release"
    }

    return message
  }

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
