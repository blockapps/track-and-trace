export const ROLES_COLOR = {
  MANUFACTURER: '#ff9000',
  DISTRIBUTOR: '#ff5722',
  RETAILER: '#4caf50',
  REGULATOR: '#00bcd4',
  ADMIN: '#3f51b5',
}

export const themeColor = (role, USER_ROLE) => {
  switch (role) {
    case USER_ROLE.MANUFACTURER:
      return ROLES_COLOR.MANUFACTURER
    case USER_ROLE.DISTRIBUTOR:
      return ROLES_COLOR.DISTRIBUTOR
    case USER_ROLE.RETAILER:
      return ROLES_COLOR.RETAILER
    case USER_ROLE.REGULATOR:
      return ROLES_COLOR.REGULATOR
    default: /* Default is admin */
      return ROLES_COLOR.ADMIN
  }
}