// createAsset
// handleEvent
// Store a hashmap of the assets
// TODO: make this an ERC 721
import "/blockapps-sol/auth/permission/contracts/PermissionedHashmap.sol";
import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";

import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "./AssetError.sol";

import "./Asset.sol";
import "./AssetEvent.sol";
import "./AssetState.sol";
import "./AssetFSM.sol";

/**
* Interface for Asset data contracts
*/

contract AssetManager is Util, RestStatus, AssetState, AssetEvent, AssetError {
    TtPermissionManager public ttPermissionManager;
    //  Assets
    PermissionedHashmap assets;

    AssetFSM assetFSM;

    /**
    * Constructor
    */
    constructor(address _ttPermissionManager) public {
      ttPermissionManager = TtPermissionManager(_ttPermissionManager);
      assets = new PermissionedHashmap(_ttPermissionManager);

      assetFSM = new AssetFSM();
    }

    function exists(string _uid) public view returns (bool) {
      return assets.contains(_uid);
    }

    function createAsset(string _uid) public returns (uint, AssetError, address) {
      if (!ttPermissionManager.canCreateAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, AssetError.NULL, 0);

      if (bytes(_uid).length == 0) return (RestStatus.BAD_REQUEST, AssetError.UID_EMPTY, 0);

      if (exists(_uid)) return (RestStatus.BAD_REQUEST, AssetError.UID_EXISTS, 0);

      Asset asset = new Asset(ttPermissionManager, _uid);
      assets.put(_uid, asset);

      return (RestStatus.CREATED, AssetError.NULL, asset);
    }

    function getAsset(string _uid) public view returns (address) {
      return assets.get(_uid);
    }

    function handleAssetEvent(string _uid, AssetEvent _assetEvent) public returns (uint, AssetError, uint, AssetState) {
      //  check permissions
      //if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, AssetState.NULL, 0);

      if (!exists(_uid)) return (RestStatus.NOT_FOUND, AssetError.UID_NOT_FOUND, 0, AssetState.NULL);

      Asset asset = Asset(assets.get(_uid));
      AssetState newState = assetFSM.handleEvent(asset.assetState(), _assetEvent);
      
      if (newState == AssetState.NULL) return (RestStatus.BAD_REQUEST, AssetError.NULL, 0, AssetState.NULL);

      (, , uint searchCounter) = asset.setAssetState(newState);

      return (RestStatus.OK, AssetError.NULL, searchCounter, newState);
    }
}
