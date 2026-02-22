export type MapLocation = {
  id?: string
  name: string
  icon: string
  color: string
  coordinates: {
    0: number
    1: number
  }
  description: string
  category: string
  address: string
}

export type MapLocationResponse = {
  data: {
    locations: MapLocation[]
  }
}
