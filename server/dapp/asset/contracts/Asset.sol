import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/blockapps-sol/meta/searchable/contracts/Searchable.sol";

import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "/dapp/asset/TtError.sol";

import "./AssetEvent.sol";
import "./AssetFSM.sol";
import "./AssetState.sol";

/**
 * Asset data container
 */
contract Asset is Util, RestStatus, Searchable, AssetState, AssetEvent {
  TtPermissionManager public ttPermissionManager;

  //internal
  AssetFSM public assetFSM;
  AssetState public assetState;

  string public uid;

  string name;
  string description;
  uint price;
  address owner;

  constructor(address _ttPermissionManager, string _uid) {
    ttPermissionManager = TtPermissionManager(_ttPermissionManager);

    uid = _uid;
    /* timestamp           = block.timestamp; */
    assetFSM            = new AssetFSM();
  }

  function handleAssetEvent(AssetEvent _event) public returns (uint, AssetState, uint) {
    //  check permissions
    //if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, AssetState.NULL, 0);
    //  check validity
    AssetState newState = assetFSM.handleEvent(assetState, _event);
    if (newState == AssetState.NULL) {
      return (RestStatus.BAD_REQUEST, AssetState.NULL, 0);
    }
    //  assume new state
    assetState = newState;
    return (RestStatus.OK, assetState, searchable());
  }
}
