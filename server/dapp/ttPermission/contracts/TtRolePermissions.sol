/*
ONLY the manufacturer can create assets
ONLY the admin can create users
ONLY the manufacturer and the distributor can transfer ownership
*/
import "./TtRole.sol";
import "./TtPermission.sol";

contract TtRolePermissions is TtRole, TtPermission {
  uint[] rolePermissions;
  constructor() public {
    rolePermissions.length = uint(TtRole.MAX);
    rolePermissions[uint(TtRole.NULL)] = 0;

    rolePermissions[uint(TtRole.ADMIN)] =
      (1 << uint(TtPermission.CREATE_USER)) ;

    rolePermissions[uint(TtRole.ASSET_MANAGER)] =
      (1 << uint(TtPermission.MODIFY_ASSET)) |
      (1 << uint(TtPermission.MODIFY_MAP));

    rolePermissions[uint(TtRole.MANUFACTURER)] =
      (1 << uint(TtPermission.TRANSFER_OWNERSHIP)) |
      (1 << uint(TtPermission.CREATE_ASSET)) ;

    rolePermissions[uint(TtRole.DISTRIBUTOR)] =
      (1 << uint(TtPermission.TRANSFER_OWNERSHIP)) ;

    rolePermissions[uint(TtRole.RETAILER)] = 0;

    rolePermissions[uint(TtRole.REGULATOR)] = 0;
  }

  function getRolePermissions(TtRole _role) public view returns (uint) {
    return rolePermissions[uint(_role)];
  }
}
