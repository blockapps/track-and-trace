// createAsset
// handleEvent
// Store a hashmap of the assets

import "/blockapps-sol/auth/permission/contracts/PermissionedHashmap.sol";
import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";

import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "/dapp/asset/TtError.sol";

import "./Asset.sol";
import "./AssetEvent.sol";
import "./AssetState.sol";

/**
* Interface for Asset data contracts
*/

contract AssetManager is Util, RestStatus, AssetState, AssetEvent, TtError {
    TtPermissionManager public ttPermissionManager;
    //  Assets
    PermissionedHashmap assets;

    /**
    * Constructor
    */
    constructor(address _ttPermissionManager) public {
      ttPermissionManager = TtPermissionManager(_ttPermissionManager);
      assets = new PermissionedHashmap(_ttPermissionManager);
    }

    function exists(string _uid) public view returns (bool) {
      return assets.contains(_uid);
    }

    function createAsset(string _uid) public returns (uint, TtError, address) {
      if (!ttPermissionManager.canCreateAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, TtError.NULL, 0);

      if (bytes(_uid).length == 0) return (RestStatus.BAD_REQUEST, TtError.UID_EMPTY, 0);

      if (exists(_uid)) return (RestStatus.BAD_REQUEST, TtError.UID_EXISTS, 0);

      Asset asset = new Asset(ttPermissionManager, _uid);
      assets.put(_uid, asset);

      return (RestStatus.CREATED, TtError.NULL, asset);
    }

    function getAsset(string _uid) public view returns (address) {
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
