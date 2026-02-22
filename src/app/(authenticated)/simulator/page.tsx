'use client'

import { useSimulatorPlanos } from '@/hooks/queries'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { PlanIndicator, SimulatorApiResponse } from '@/types/simulator'

type PlanName = 'Básico' | 'Intermediário' | 'Premium'

const PLAN_KEYS: Record<PlanName, string> = {
  Básico: 'basic',
  Intermediário: 'intermediate',
  Premium: 'premium',
}

const ADDITIONAL_COVERAGE_KEYS = [
  'roubo-furto',
  'colisao',
  'incendio',
  'fenomenos',
] as const

const COVERAGE_TRANSLATION_KEYS: Record<
  (typeof ADDITIONAL_COVERAGE_KEYS)[number],
  string
> = {
  'roubo-furto': 'coverageTheft',
  colisao: 'coverageCollision',
  incendio: 'coverageFire',
  fenomenos: 'coverageNatural',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function normalizeResponse(raw: SimulatorApiResponse) {
  const data = (raw as { data?: SimulatorApiResponse }).data ?? raw
  return {
    includedBenefits: data.includedBenefits ?? [],
    plansIndicators: data.plansIndicators ?? [],
  }
}

export default function SimulatorPage() {
  const t = useTranslations('simulator')
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Intermediário')
  const [vehicleValue, setVehicleValue] = useState(50000)
  const [clientAge, setClientAge] = useState(28)
  const [coverages, setCoverages] = useState<Record<string, boolean>>({
    'roubo-furto': true,
    colisao: true,
    incendio: true,
    fenomenos: false,
  })

  const { data: rawData, isPending } = useSimulatorPlanos()

  const { includedBenefits, plansIndicators } = rawData
    ? normalizeResponse(rawData)
    : { includedBenefits: [], plansIndicators: [] }

  const planPrices = useMemo(() => {
    const map: Record<string, number> = {}
    plansIndicators.forEach((p) => {
      map[p.name] = p.value
    })
    return map
  }, [plansIndicators])

  const basePrice = planPrices[selectedPlan] ?? 145.9
  const extraTotal = ADDITIONAL_COVERAGE_KEYS.reduce(
    (sum, id) => sum + (coverages[id] ? 25 : 0),
    0,
  )
  const totalPrice = basePrice + extraTotal

  const toggleCoverage = (id: (typeof ADDITIONAL_COVERAGE_KEYS)[number]) => {
    setCoverages((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          <span className="text-sm text-slate-400">{t('loading')}</span>
        </div>
      </div>
    )
  }

  const planCards: { name: PlanName; recommended?: boolean }[] = [
    { name: 'Básico' },
    { name: 'Intermediário' },
    { name: 'Premium', recommended: true },
  ]

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid gap-6 min-[1000px]:grid-cols-[1.2fr_1fr]">
        {/* Coluna da esquerda */}
        <div className="flex flex-col gap-6">
          {/* Planos personalizados */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {t('personalizedPlans')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {planCards.map((plan) => {
                const price = planPrices[plan.name] ?? 0
                const isSelected = selectedPlan === plan.name

                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlan(plan.name)}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-6 transition',
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20',
                    )}
                  >
                    {plan.recommended && (
                      <span className="absolute right-2 top-2 rounded-full bg-cyan-500/30 px-2 py-0.5 text-[10px] font-medium text-cyan-200">
                        {t('recommended')}
                      </span>
                    )}
                    <p className="text-sm font-medium text-slate-200">
                      {t(PLAN_KEYS[plan.name])}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-xs text-slate-400">{t('perMonth')}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Valor do veículo */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h3 className="mb-3 text-sm font-semibold text-white">
              {t('vehicleValue')}: {formatCurrency(vehicleValue)}
            </h3>
            <div className="space-y-1">
              <Slider
                min={10000}
                max={500000}
                step={1000}
                value={vehicleValue}
                onValueChange={setVehicleValue}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{formatCurrency(10000)}</span>
                <span>{formatCurrency(500000)}</span>
              </div>
            </div>
          </section>

          {/* Idade do Cliente */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h3 className="mb-3 text-sm font-semibold text-white">
              {t('clientAge')}: {clientAge} {t('years')}
            </h3>
            <div className="space-y-1">
              <Slider
                min={18}
                max={90}
                step={1}
                value={clientAge}
                onValueChange={setClientAge}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>18 anos</span>
                <span>90 anos</span>
              </div>
            </div>
          </section>

          {/* Coberturas Adicionais */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h3 className="mb-4 text-sm font-semibold text-white">
              {t('additionalCoverages')}
            </h3>
            <ul className="space-y-3">
              {ADDITIONAL_COVERAGE_KEYS.map((id) => (
                <li
                  key={id}
                  className="flex items-center justify-between gap-4"
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={coverages[id] ?? false}
                      onCheckedChange={() => toggleCoverage(id)}
                      className="h-5 w-5 rounded border-white/40 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-sm text-slate-200">
                      {t(COVERAGE_TRANSLATION_KEYS[id])}
                    </span>
                  </label>
                  <span className="text-sm text-slate-400">
                    + {formatCurrency(25)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Coluna da direita */}
        <div className="flex flex-col gap-6">
          {/* Benefícios Inclusos */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h3 className="mb-4 text-sm font-semibold text-white">
              {t('includedBenefits')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {includedBenefits.map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {benefit}
                </span>
              ))}
              {includedBenefits.length === 0 && (
                <p className="text-sm text-slate-500">
                  Nenhum benefício disponível.
                </p>
              )}
            </div>
          </section>

          {/* Indicadores */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card-fade">
            <h3 className="mb-4 text-sm font-semibold text-white">
              {t('indicators')}
            </h3>
            <div className="space-y-3">
              {plansIndicators.map((plan: PlanIndicator) => (
                <div
                  key={plan.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {PLAN_KEYS[plan.name as PlanName]
                        ? t(PLAN_KEYS[plan.name as PlanName])
                        : plan.name}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-400">
                      Conversão: {plan.conversion}% ROI: {plan.roi}%
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(plan.value)}
                  </p>
                </div>
              ))}
              {plansIndicators.length === 0 && (
                <p className="text-sm text-slate-500">{t('noIndicators')}</p>
              )}
            </div>
          </section>

          {/* Resumo do plano selecionado */}
          <section className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-6 shadow-card-fade">
            <h3 className="mb-2 text-sm font-semibold text-white">
              {t('selectedPlan')}
            </h3>
            <p className="text-lg font-bold text-white">
              {t(PLAN_KEYS[selectedPlan])}
            </p>
            <p className="mt-2 text-2xl font-bold text-cyan-400">
              {formatCurrency(totalPrice)}
              <span className="ml-1 text-sm font-normal text-slate-400">
                /mês
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
