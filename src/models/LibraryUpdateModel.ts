export class LibraryUpdateModel {
  constructor(
    public groupId: string,
    public artifact: string,
    public version: string
  ) {
  }
}
