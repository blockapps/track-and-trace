import "/blockapps-sol/auth/permission/contracts/PermissionManager.sol";
import "./TtPermission.sol";
import "./TtRolePermissions.sol";

/**
* TT Permission Manager
*/
contract TtPermissionManager is PermissionManager, TtPermission, TtRolePermissions {

  constructor(
    address _admin,
    address _master) public
    PermissionManager(_admin, _master) {
    // grant Tt Admin permissions to admin
    grantRole('Admin', _admin, TtRole.ADMIN);
  }

  function grantRole(string _id, address _address, TtRole _role) public returns (uint, uint) {
    uint permissions = getRolePermissions(_role);
    return grant(_id, _address, permissions);
  }

  function canCreateAsset(address _address) returns (bool) {
    uint permissions = 1 << uint(TtPermission.CREATE_ASSET);
    return check(_address, permissions) == RestStatus.OK;
  }

  function canModifyAsset(address _address) returns (bool) {
    uint permissions = 1 << uint(TtPermission.MODIFY_ASSET);
    return check(_address, permissions) == RestStatus.OK;
  }

  function canModiyMap(address _address) returns (bool) {
    uint permissions = 1 << uint(TtPermission.MODIFY_MAP);
    return check(_address, permissions) == RestStatus.OK;
  }

  function canTransferOwnership(address _address) returns (bool) {
    uint permissions = 1 << uint(TtPermission.TRANSFER_OWNERSHIP);
    return check(_address, permissions) == RestStatus.OK;
  }

  function canCreateUser(address _address) returns (bool) {
    uint permissions = 1 << uint(TtPermission.CREATE_USER);
    return check(_address, permissions) == RestStatus.OK;
  }
}
