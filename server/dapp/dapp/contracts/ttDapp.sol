// asset manager
// permission manager
// user manager
import "/blockapps-sol/rest/contracts/RestStatus.sol";
import "/blockapps-sol/auth/user/contracts/UserManager.sol";
import "/dapp/asset/contracts/AssetManager.sol";
import "/dapp/ttPermission/contracts/TtPermissionManager.sol";
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

 }
