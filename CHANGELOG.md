# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.2] - 2021-11-19
### Added
- TS typings reference in package.json

## [2.1.1] - 2021-11-19
### Added
- TS typings

### Changed
- Replaced `request` dependency with `axios`

## [2.1.0] - 2019-10-07
### Removed
- `api-key` is no longer used. Setting can be removed.

### Added
- Nested errors are now supported

## [2.0.0] - 2019-08-07
### Added
- Use `@janiscommerce/Settings` dependency

### Changed
- `api-key` config comes from `path/to/root/[MS_PATH]/config/.janiscommercerc.json`
- `router` config comes from `path/to/root/[MS_PATH]/config/.janiscommercerc.json`
- `router-fetcher` folder changed to `lib/`

## [1.0.0] - 2019-06-11
### Added
- Project inited
- `Router-Fetcher` added
- `Unit Tests` added
- `Router-Fetcher-Error` added

### Changed
- `Router-Fetcher` constructs, don't need parametres anymore
- `Router-Fetcher-Error` changed response format.
- Update `Unit Tests`