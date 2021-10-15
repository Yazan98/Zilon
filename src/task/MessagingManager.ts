import { LibraryUpdateModel } from "../models/LibraryUpdateModel";
import { App } from "@slack/bolt";
import { ApplicationConfigFile } from "../models/ApplicationConfigFile";

export class MessagingManager {

  private static CONFIG_FILE = "config.json";
  private static FIREBASE_KEY = "firebase";

  // Hardcoded Links
  private static FIREBASE_DOCUMENTATION = "https://firebase.google.com/docs/firestore/";

  public sendMessageUpdateDependencies(libraries: Array<LibraryUpdateModel>) {
    let configFile = new ApplicationConfigFile("", "", "");
    const fs = require("fs");
    const data = fs.readFileSync(MessagingManager.CONFIG_FILE, 'utf8');
    configFile = JSON.parse(data)
    for (let i = 0; i < libraries.length; i++) {
      const library = libraries[i]
      let message = "";
      message += "*" + MessagingManager.capitalizeFirstLetter(library.artifact.split("-").join(" ")) + " Released New Version *\n"
      message += " 1. New Version : " + library.version + "\n"
      message += " 2. Update Dependency : " + "implementation \'" + library.groupId + ":" + library.artifact + ":" + library.version + "\'" + "\n"
      if (library.groupId.includes(MessagingManager.FIREBASE_KEY)) {
        message += " 3. Documentation : " + MessagingManager.FIREBASE_DOCUMENTATION + "\n";
      }
      MessagingManager.sendSlackMessage(configFile, message)
    }
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

  private static getSlackApplicationInstance(signingSecrete: string, token: string): App {
    return new App({
      signingSecret: signingSecrete,
      token: token,
    });
  }

}
