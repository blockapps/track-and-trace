import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/blockapps-sol/meta/searchable/contracts/Searchable.sol";

import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "./AssetError.sol";

import "./AssetState.sol";

/**
 * Asset data container
 */
contract Asset is Util, RestStatus, Searchable, AssetState, AssetError {
  TtPermissionManager public ttPermissionManager;

  string public uid;
  AssetState public assetState;

  string name;
  string description;
  uint price;
  address owner;

  constructor(address _ttPermissionManager, string _uid) {
    ttPermissionManager = TtPermissionManager(_ttPermissionManager);

    uid = _uid;
    assetState = AssetState.CREATED;
    /* timestamp           = block.timestamp; */
  }

  function setAssetState(AssetState _assetState) returns (uint, AssetError, uint) {
    // check permissions
    //if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, AssetState.NULL, 0);

    assetState = _assetState;
    return (RestStatus.OK, AssetError.NULL, searchable());
  }
}
