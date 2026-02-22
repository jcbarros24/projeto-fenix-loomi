export type DashboardKpiTrend = {
  name?: string
  data?: number[]
}

export type DashboardResponse = {
  kpisTrend?: {
    labels?: string[]
    arpuTrend?: DashboardKpiTrend
    churnTrend?: DashboardKpiTrend
    conversionTrend?: DashboardKpiTrend
    retentionTrend?: DashboardKpiTrend
  }
  kpisResume?: {
    arpu?: { valor?: number; variacao?: number }
    churn?: { valor?: number; variacao?: number }
    conversion?: { valor?: number; variacao?: number }
    retention?: { valor?: number; variacao?: number }
  }
  activeClients?: {
    data?: Array<{
      id?: string
      name?: string
      email?: string
      status?: string
      secureType?: string
      location?: string
      monthValue?: number
      renewalDate?: string
    }>
    filters?: {
      locations?: string[]
      secureType?: string[]
      status?: string[]
    }
  }
  segments?: Array<{
    name?: string
    valor?: number
  }>
}
