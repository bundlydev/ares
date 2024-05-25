## [0.2.0] - 2024-05-25

### Added

- Add multi-identity management
- Add actor class support
- Improve project structure
- Update documentation
- Add CHANGELOG.md
- Add experimental restCanister feature

### Breaking changes

- Identity providers should notify the client about new authentications using the `addDelegationChain` method
- Identity providers no longer store the authentication status, this is done at the Client

## [0.1.0] - 2024-01-18

### Added

- Fisrt version

### Fixed
