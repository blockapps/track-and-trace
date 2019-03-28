import "/blockapps-sol/dist/util/contracts/Util.sol";
import "/blockapps-sol/dist/rest/contracts/RestStatus.sol";
import "/blockapps-sol/dist/meta/searchable/contracts/Searchable.sol";

import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
import "./AssetError.sol";

import "./AssetState.sol";

/**
 * Asset data container
 */
contract Asset is Util, RestStatus, Searchable, AssetState, AssetError {
  TtPermissionManager public ttPermissionManager;

  string public sku;
  string name;
  string description;
  uint price;
  bytes32[] keys;
  bytes32[] values;
  address public owner;
  AssetState public assetState;

  constructor(
    address _ttPermissionManager,
    string _sku,
    string _name,
    string _description,
    uint _price,
    bytes32[] _keys,
    bytes32[] _values,
    address _owner
  ) {
    ttPermissionManager = TtPermissionManager(_ttPermissionManager);

    sku = _sku;
    name = _name;
    description = _description;
    price = _price;
    owner = _owner;
    keys = _keys;
    values = _values;
    assetState = AssetState.CREATED;

    /* timestamp           = block.timestamp; */
  }

  function setAssetState(AssetState _assetState) returns (uint, AssetError, uint) {
    // check permissions
    if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.FORBIDDEN, AssetError.NULL, 0);

    assetState = _assetState;
    return (RestStatus.OK, AssetError.NULL, searchable());
  }

  function setOwner(address _newOwner) returns (uint, AssetError, uint) {
    // check permissions
    if (!ttPermissionManager.canModifyAsset(msg.sender)) return (RestStatus.FORBIDDEN, AssetError.NULL, 0);

    owner = _newOwner;
    return (RestStatus.OK, AssetError.NULL, searchable());
  }

}
