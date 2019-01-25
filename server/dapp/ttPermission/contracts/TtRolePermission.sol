/*
ONLY the manufacturer can create assets
ONLY the admin can create users
ONLY the manufacturer and the distributor can transfer ownership
*/
import "./TtRole.sol";
import "./TtPermission.sol";

contract TtRolePermission  is TtRole, TtPermission {
  uint[] rolePermissions;
  constructor() {
    rolePermissions.length = uint(TtRole.REGULATOR)+1;
    rolePermissions[uint(TtRole.NULL)] = 0;

    rolePermissions[uint(TtRole.ADMIN)] =
      (1 << uint(TtPermission.CREATE_USER)) ;

    rolePermissions[uint(TtRole.MANUFACTURER)] =
      (1 << uint(TtPermission.TRANSFER_OWNERSHIP_MAP)) |
      (1 << uint(TtPermission.CREATE_ASSET)) ;

    rolePermissions[uint(TtRole.DISTRIBUTOR)] =
      (1 << uint(TtPermission.TRANSFER_OWNERSHIP_MAP)) ;

    rolePermissions[uint(TtRole.RETAILER)] = 0;

    rolePermissions[uint(TtRole.REGULATOR)] = 0;
  }

  function getRolePermissions(TtRole _role) returns (uint) {
    return rolePermissions[uint(_role)];
  }
}
