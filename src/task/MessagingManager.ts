import { LibraryUpdateModel } from "../models/LibraryUpdateModel";
import fs from "fs";

export class MessagingManager {

  private static CONFIG_FILE = "config.json"

  public static sendMessageUpdateDependencies(libraries: Array<LibraryUpdateModel>) {
    let configFile = {
      appId: "",
      token: "",
      channelId: ""
    };

    fs.readFile(MessagingManager.CONFIG_FILE, 'utf8', function readFileCallback(err, data){
      if (err){
        console.log(err);
      } else {
        configFile = JSON.parse(data)
      }});
  }

}
