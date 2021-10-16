export class ApplicationConfigFile {
  constructor(
    public token: string,
    public channelId: string,
    public signingSecret: string,
    public isGoogleMavenRepositoryEnabled: boolean
  ) {
  }
}