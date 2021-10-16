export class LibraryUpdateModel {
  constructor(
    public groupId: string,
    public artifact: string,
    public version: string,
    public isGithubSource: boolean,
    public url: string,
    public releaseUrl: string,
    public name: string
  ) {
  }
}
