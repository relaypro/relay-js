# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2021-06-04

### Added
- Improved `README.md` documentation with explanation of a simple workflow sampl
- Support `incident` event
- Add optional `push_opts` on notification functions
- Add optional `suppressTTS` parameter on `setChannel`
- New workflow events
  - `Event.STOP` or `stop` emitted when ibot has ended the workflow
  - `Event.ERROR` or `error` emitted when
    - An error response is received from ibot
    - Workflow event processing throws an error
    - Action is sent to ibot but websocket connection is closed
- New workflow actions available:
  - `restartDevice()` and `powerDownDevice()` restarts and powers down a Relay device
    (not an App or Dash, of course)
  - `ledAction(effect, args)` more general and robust LED action that other LED actions
    can build upon
  - `setDeviceMode(mode)` put a device in `panic` or `alarm` mode
  - `placeCall(call)`, `answerCall(call)`, and `hangupCall(call)` enable initiating and
    managing calling via workflows
  - `stopPlayback(id)` will stop audio playback initiated by `say()` and `play()`
  - `setTimer(type, name, timeout, timeout_type)` and `clearTimer(name)` enable managing
    timers set in the workflow. There exist some use cases that managing the timer hosted
    in Relay Servers avoids certain workflow coordination pitfalls.
  - `unsetVar(name)` and `unset(name[])` enables deleting variables set by `setVar()` and `set()`
- Initial (but disabled) implementation of syncing documentation to readme.io

### Changed
- Serially execute event handlers. This will allow for more predictable processing. For
  instance, subsequent workflow events are not processed until previously emitted events
  are completed.
- Notification actions now have a separate time out of 60 seconds. At present, notification
  actions are synchronous in delivery. As a result, when a workflow targets a large number
  of devices, the default action timeout of 5 seconds would frequently be met. Initial
  solution is to increase notification action timeout to 60 seconds. __In the future semantics
  may be changed to asynchronous processing of notificaiton actions.__
- `setChannel()` method signature has changed
- `say()` and `play()` both now return an identifier that can be used with new `stopPlayback()`
  to stop the ongoing playback of spoken text or a sound.

### Removed
- Section about "changelog" vs "CHANGELOG".

## [1.0.2] - 2021-03-02

### Changed
- Fix [README.md](README.md) with correct npm installation instructions and git URL.

### Removed
- Extract [CLI](https://github.com/relaypro/relay-cli) and
  [NodeJS Samples](https://github.com/relaypro/relay-samples) to their own repositories

## [1.0.1] - 2021-03-01

### Changed
- Fix capture of workflow events with `w` in the name


## [1.0.0] - 2021-02-26

### Added
- Initial release of the Relay SDK for NodeJS.

[Unreleased]: https://github.com/relaypro/relay-js/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/relaypro/relay-js/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/relaypro/relay-js/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/relaypro/relay-js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/relaypro/relay-js/releases/tag/v1.0.2
