import axios, { Axios } from 'axios';

export class NetworkInstance {

  public static SUCCESS_RESPONSE_CODE = 200;

  // Base Url's For Requests
  public static ANDROID_MAVEN_PATH = '/android/maven2/';

  // General Url's For Requests
  public static ANDROID_ALL_LIBRARIES = 'master-index.xml';
  public static GROUP_ARTIFACTS = "/group-index.xml";
  public static GITHUB_REPOS_KEY = "/repos/";
  public static GITHUB_RELEASES_KEY = "releases";

  public static getGithubRepositoriesInstance(): Axios {
    let instance = axios.create({
      timeout: 5000,
      baseURL: 'https://api.github.com',
      responseType: 'json',
      headers: { Accept: 'application/json' },
    });

    instance.interceptors.request.use(request => {
      console.log('Github Starting Request', request.url)
      return request
    })

    return instance
  }

  public static getGoogleMavenRepositoriesInstance(): Axios {
    let instance = axios.create({
      timeout: 5000,
      baseURL: 'https://dl.google.com',
      responseType: 'text',
      headers: { Accept: 'application/xml' },
    });

    instance.interceptors.request.use(request => {
      console.log('Google Starting Request', request.url)
      return request
    })

    return instance;
  }

}
