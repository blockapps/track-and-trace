// TODO: get this from the server
export const ROLES = [
  'NULL',
  'ADMIN',
  'ASSET_MANAGER',
  'MANUFACTURER',
  'DISTRIBUTOR',
  'RETAILER',
  'REGULATOR',
  'MAX'
]

export const ROLES_INDEX = {
  NULL: 0,
  ADMIN: 1,
  ASSET_MANAGER: 2,
  MANUFACTURER: 3,
  DISTRIBUTOR: 4,
  RETAILER: 5,
  REGULATOR: 6,
  MAX: 7
}

export const ROLES_COLOR = {
  MANUFACTURER: '#ff9000',
  DISTRIBUTOR: '#ff5722',
  RETAILER: '#4caf50',
  REGULATOR: '#00bcd4',
  ADMIN: '#3f51b5',
}

export const themeColor = (role) => {
  switch (role) {
    case ROLES_INDEX.MANUFACTURER:
      return ROLES_COLOR.MANUFACTURER
    case ROLES_INDEX.DISTRIBUTOR:
      return ROLES_COLOR.DISTRIBUTOR
    case ROLES_INDEX.RETAILER:
      return ROLES_COLOR.RETAILER
    case ROLES_INDEX.REGULATOR:
      return ROLES_COLOR.REGULATOR
    default: /* Default is admin */
      return ROLES_COLOR.ADMIN
  }
}