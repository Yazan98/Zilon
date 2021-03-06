export class GoogleMavenLibrary {
  constructor(
    public groupId: string,
    public artifacts: Array<GoogleMavenArtifact>
  ) {
  }
}

export class GoogleMavenArtifact {
  constructor(
    public name: string,
    public versions: Array<string>
  ) {
  }
}

export class GoogleCacheArtifact {
  constructor(
    public artifact: string,
    public version: string
  ) {
  }
}
