export class GithubLibrary {
  constructor(
    public name: string,
    public url: string
  ) {
  }
}


export class GithubContainerFileContent {
  constructor(
    public libraries: Array<GithubLibrary>
  ) {
  }
}

export class GithubLibrariesCacheContainer {
  constructor(
    public libraries: Array<GithubCacheLibrary>
  ) {
  }
}

export class GithubCacheLibrary {
  constructor(
    public name: string,
    public release: string
  ) {
  }
}