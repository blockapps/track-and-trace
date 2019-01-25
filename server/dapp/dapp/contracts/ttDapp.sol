// asset manager
// permission manager
// user manager
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/blockapps-sol/auth/user/contracts/UserManager.sol";
import "/server/dapp/asset/contracts/AssetManager.sol";
import "/server/dapp/ttPermission/contracts/TtPermissionManager.sol";
/**
 * Single entry point to all the project's contract
 * Deployed by the deploy script
 */
 contract TtDapp is RestStatus {
   // NOTE: variable name MUST match contract name
   UserManager public userManager;
   AssetManager public assetManager;
   TtPermissionManager public ttPermissionManager;

   // internal
   address owner; //  debug only

   /**
    *  Instantiate Managers
    *  @param _ttPermissionManager address - the projects permission manager
    */
   constructor(address _ttPermissionManager) {
     owner = msg.sender;  //  debug only
     ttPermissionManager = TtPermissionManager(_ttPermissionManager);
     userManager = new UserManager(msg.sender);
     assetManager = new AssetManager(ttPermissionManager);
   }

   /**
    * Replace the AssetManager
    * @param _address address - the new manager
    *
    * @return {uint}  RestStatus
    */
    function replaceAssetManager(address _address) returns (uint) {
      //  transfer the map from the existing manager to the new manager
      uint restStatus = assetManager.transferOwnershipMap(_address);
      if (restStatus != RestStatus.OK)  return restStatus;
      //  replace the manager
      assetManager = AssetManager(_address);
      return RestStatus.OK;
    }
 }
