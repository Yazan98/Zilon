import axios, { Axios } from 'axios';

export class NetworkInstance {

  // Base Url's For Requests
  public static ANDROID_MAVEN_PATH = '/android/maven2/';

  // General Url's For Requests
  public static ANDROID_ALL_LIBRARIES = 'master-index.xml';
  public static GROUP_ARTIFACTS = "/group-index.xml";

  static getGoogleMavenRepositoriesInstance(): Axios {
    let instance = axios.create({
      timeout: 5000,
      baseURL: 'https://dl.google.com',
      responseType: 'text',
      headers: { Accept: 'application/xml' },
    });

    // instance.interceptors.request.use(request => {
    //   console.log('Starting Request', JSON.stringify(request, null, 2))
    //   return request
    // })

    return instance;
  }

}
