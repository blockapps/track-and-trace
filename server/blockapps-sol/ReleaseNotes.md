### Version: 3.0.0

#### Major upgrades
* All the STRATO api endpoints protected with oauth. So, Tokens are passing in every API.
* All the testcases are now compatible with oauth.
* Must use `blockapps-rest` `^7.4.3`

------------
### Version: 2.0.1

#### Minor upgrades
* 32-bytes limitation removed from Hashmap. Using keccak256 instead of string->b32

------------
### Version: 2.0.0

#### Major upgrades
* Backwards Incompatibilities: OAuth support. Old auth using pwHash removed.
* Must use `blockapps-rest` `^6.1.1`

------------
### Version: 1.2.2

#### Minor upgrades
* utf string length function added to `Util`

------------

### Version: 1.2.1

#### Minor upgrades
* `listPermits` & `listEvents` added to convert bitmask to human-readable enum values

#### Issues Fixed
* `uintToString` fixed.

------------

### Version: 1.2.0

#### Minor upgrades
* `PermissionedHashmap` added.
  * Takes an implementation _PermissionManager_ on construction
  * `put()` and `remove()` require `canModifyMap()` to be provided by the _PermissionManager_

------------
### Version: 1.1.1

#### Minor upgrades
* `RestStatus` added the following codes:
   * `504` GATEWAY_TIMEOUT
   * `502` BAD_GATEWAY

------------

### Version: 1.1.0

#### Minor upgrades
* `PermissionManager` now logs the following events:
   * `grant` permissions to an address
   * `revoke` permissions of an address
   * `check` that resulted an _Unauthorized_ response
* `Hashmap` now supports `remove`
   * Note: the removed key will not exist anymore, however, the address array is not compacted. As a result, `size` will reflect the number of active and deleted entries.

------------

### Version: 0.0.0
* semver https://semver.org/

#### Major upgrades
* Backwards Incompatibilities (Watch out for this one !!)
* Link to requirements and client facing documents
* semver X.0.0

#### Minor upgrades
* New Features
* Performance
* semver 0.X.0

#### Issues Fixed
* Bugs, yes we used to have them
* semver 0.0.X

#### Known Issues
* Whats broken, known workaround
