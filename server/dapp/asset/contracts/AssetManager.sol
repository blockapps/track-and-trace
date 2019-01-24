// createAsset
// handleEvent
// Store a hashmap of the assets

import "/blockapps-sol/collections/hashmap/contracts/Hashmap.sol";
import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/server/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "/server/dapp/asset/TtError.sol"

import "./Asset.sol";
import "./AssetEvent.sol";
import "./AssetState.sol";

/**
* Interface for Asset data contracts
*/

contract AssetManager is Util, RestStatus, AssetState, AssetEvent {
    TtPermissionManager public ttPermissionManager;
    //  Assets
    Hashmap assets;

    /**
    * Constructor
    */
    constructor(address _ttPermissionManager) {
        ttPermissionManager = TtPermissionManager(_ttPermissionManager);
        assets = new Hashmap();
    }

    function exists(string _uid) return (bool) {
        return assets.contains(_uid);
    }

    function validateUid(string _uid) returns (uint, TtError) {
      if(bytes(_uid).length == 0)
        return (RestStatus.BAD_REQUEST, TtError.UID_EMPTY);

      //  error if exists
      if(exists(_uid))
        return (RestStatus.BAD_REQUEST, TtError.UID_EXISTS);

      return (RestStatus.OK, TtError.NULL);
    }

    /* function validateAsset(bytes32[] _bytes32Array) returns (uint, EchoError) {

    } */

    function getAsset(string _uid) constant returns (address) {
      return assets.get(_uid);
    }

    function _handleAssetEvent(string _uid, AssetEvent _assetEvent) public returns (uint, AssetState, uint) {
      //  get the Asset
      Asset asset = Asset(getAsset(_uid));
      //  error if Asset not properly initalized
      if (asset.assetState() == AssetState.NULL) {
        return (RestStatus.BAD_REQUEST, AssetState.NULL, 0);
      }

      //  validate new event
      var (restStatus, newState, searchCounter) = asset.handleAssetEvent(_assetEvent);

      if (newState == AssetState.NULL) {
        return (RestStatus.BAD_REQUEST, newState, 0);
      }

      return (restStatus, newState, searchCounter);
    }

}
