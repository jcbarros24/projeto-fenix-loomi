export type PlanIndicator = {
  name: string
  conversion: number
  roi: number
  value: number
}

export type SimulatorApiResponse = {
  data?: {
    includedBenefits?: string[]
    plansIndicators?: PlanIndicator[]
  }
  includedBenefits?: string[]
  plansIndicators?: PlanIndicator[]
}
