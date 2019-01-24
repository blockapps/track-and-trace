import "/blockapps-sol/util/contracts/Util.sol";
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/server/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "/server/dapp/asset/TtError.sol"
import "./AssetEvent.sol";
import "./AssetFSM.sol";
import "./AssetState.sol";

/**
 * Asset data container
 */
contract Asset is Util, AssetState, AssetEvent  {
  //internal
  AssetFSM public assetFSM;
  AssetState public assetState;

  string name;
  string description;
  uint price;
  address owner;

  constructor(
     address _ttPermissionManager,
     bytes32[] _bytes32Array
   ) {
     // internal
     ttPermissionManager = TtPermissionManager(_ttPermissionManager);
     /* timestamp           = block.timestamp; */
     assetFSM            = new AssetFSM();

   }
  function handleAssetEvent(AssetEvent _event) public returns (uint, AssetState, uint) {
    //  check permissions
    if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.UNAUTHORIZED, AssetState.NULL, 0);
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
