export const ROLES = {
  MANUFACTURER: 'MANUFACTURER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  RETAILER: 'RETAILER',
  REGULATOR: 'REGULATOR',
  ADMIN: 'ADMIN'
}

export const ROLES_COLOR = {
  MANUFACTURER: '#ff9000',
  DISTRIBUTOR: '#ff5722',
  RETAILER: '#4caf50',
  REGULATOR: '#00bcd4',
  ADMIN: '#3f51b5'
}

export const themeColor = (role) => {
  switch (role) {
    case ROLES.MANUFACTURER:
      return ROLES_COLOR[ROLES.MANUFACTURER]
    case ROLES.DISTRIBUTOR:
      return ROLES_COLOR[ROLES.DISTRIBUTOR]
    case ROLES.RETAILER:
      return ROLES_COLOR[ROLES.RETAILER]
    case ROLES.REGULATOR:
      return ROLES_COLOR[ROLES.REGULATOR]
    default: /* Default is admin */
      return ROLES_COLOR[ROLES.ADMIN]
  }
}