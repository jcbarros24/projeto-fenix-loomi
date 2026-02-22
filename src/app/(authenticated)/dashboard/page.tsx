'use client'

import { useDashboardData, useMapLocations } from '@/hooks/queries'
import { useTranslations } from 'next-intl'
import type { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import 'ol/ol.css'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import View from 'ol/View'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ActiveClientsDataTable } from '@/components/organisms/ActiveClientsDataTable/activeClientsDataTable'
import { getMapCategoryLabel } from '@/lib/mapCategoryLabel'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

type KpiKey = 'retention' | 'conversion' | 'churn' | 'arpu'

const MAP_CATEGORIES = [
  'sports',
  'transport',
  'heritage',
  'education',
  'tourism',
  'health',
  'park',
  'food',
  'commerce',
] as const satisfies readonly string[]

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#ef4444',
  transport: '#f59e0b',
  heritage: '#8b5cf6',
  education: '#3b82f6',
  tourism: '#06b6d4',
  health: '#22c55e',
  park: '#84cc16',
  food: '#ec4899',
  commerce: '#6366f1',
  default: '#94a3b8',
}

const resolveCategoryColor = (category?: string) => {
  const normalized = (category ?? '').toLowerCase().trim()
  if (CATEGORY_COLORS[normalized]) return CATEGORY_COLORS[normalized]
  return CATEGORY_COLORS.default
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tMap = useTranslations('map')
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const tooltipLabelRef = useRef<
    { t: (k: string) => string; tMap: (k: string) => string }
  >({ t: () => '', tMap: () => '' })
  tooltipLabelRef.current = { t, tMap }
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<Overlay | null>(null)
  const vectorSourceRef = useRef<VectorSource>(new VectorSource())
  const [selectedKpi, setSelectedKpi] = useState<KpiKey>('retention')

  const {
    data: dashboardData,
    isPending: isDashboardPending,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
  } = useDashboardData()

  const { data: locationsData } = useMapLocations()

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: (feature) => {
        const category = feature.get('category') as string | undefined
        const color = resolveCategoryColor(category)

        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#0b0d1c', width: 2 }),
          }),
        })
      },
    })

    const overlay =
      tooltipRef.current &&
      new Overlay({
        element: tooltipRef.current,
        offset: [10, 0],
        positioning: 'bottom-left',
        stopEvent: false,
      })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-34.8702743, -8.0583154]),
        zoom: 12,
      }),
      controls: [],
    })

    if (overlay) {
      map.addOverlay(overlay)
      overlayRef.current = overlay
    }

    map.on('pointermove', (event) => {
      if (!overlayRef.current || !tooltipRef.current) return

      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat)

      if (!feature) {
        tooltipRef.current.style.display = 'none'
        map.getTargetElement()?.classList.remove('cursor-pointer')
        return
      }

      const name = feature.get('name') as string | undefined
      const category = feature.get('category') as string | undefined
      const { t: tCur, tMap: tMapCur } = tooltipLabelRef.current
      const categoryLabel = category
        ? getMapCategoryLabel(tMapCur, category)
        : ''
      const parts = [name, categoryLabel].filter(Boolean)
      const label = parts.length > 0 ? parts.join(' • ') : tCur('client')

      tooltipRef.current.textContent = label
      tooltipRef.current.style.display = 'block'
      overlayRef.current.setPosition(event.coordinate)
      map.getTargetElement()?.classList.add('cursor-pointer')
    })

    mapInstanceRef.current = map

    return () => {
      map.setTarget(undefined)
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const source = vectorSourceRef.current
    source.clear()

    const locations = locationsData?.data?.locations ?? []

    if (!locations.length) return

    const features = locations
      .map((location) => {
        const lon = location.coordinates?.[0]
        const lat = location.coordinates?.[1]

        if (typeof lat !== 'number' || typeof lon !== 'number') {
          return null
        }

        const feature = new Feature(new Point(fromLonLat([lon, lat])))

        feature.setProperties({
          name: location.name,
          category: location.category,
          description: location.description,
        })

        return feature
      })
      .filter(Boolean) as Feature<Point>[]

    if (features.length) {
      source.addFeatures(features)
    }
  }, [locationsData])

  const defaultMonths = useMemo(
    () => [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ],
    [],
  )

  const kpiLabelMap = useMemo(
    () => ({
      retention: t('retention'),
      conversion: t('conversion'),
      churn: t('churn'),
      arpu: t('arpu'),
    }),
    [t],
  )

  const selectedTrend = useMemo(() => {
    const trends = dashboardData?.kpisTrend

    if (!trends) return undefined

    const trendMap: Record<KpiKey, typeof trends.retentionTrend | undefined> = {
      retention: trends.retentionTrend,
      conversion: trends.conversionTrend,
      churn: trends.churnTrend,
      arpu: trends.arpuTrend,
    }

    return trendMap[selectedKpi]
  }, [dashboardData, selectedKpi])

  const areaData = useMemo(
    () =>
      selectedTrend?.data ?? [
        90, 110, 140, 160, 155, 130, 120, 135, 150, 175, 190, 170,
      ],
    [selectedTrend],
  )

  const defaultConversionMonths = useMemo(
    () => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    [],
  )

  const areaSeries = useMemo(
    () => [
      {
        name: selectedTrend?.name ?? kpiLabelMap[selectedKpi],
        data: areaData,
      },
    ],
    [areaData, kpiLabelMap, selectedKpi, selectedTrend],
  )

  const areaOptions = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: '#94a3b8',
      },
      colors: ['#43D2CB'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.5,
          opacityFrom: 0.9,
          opacityTo: 0.1,
        },
      },
      grid: {
        borderColor: 'rgba(148, 163, 184, 0.15)',
        strokeDashArray: 4,
      },
      xaxis: {
        categories: dashboardData?.kpisTrend?.labels ?? defaultMonths,
      },
      yaxis: { labels: { formatter: (val: number) => `${val}` } },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) =>
            selectedKpi === 'arpu'
              ? `R$ ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              : `${val.toFixed(1)}%`,
        },
      },
    }),
    [dashboardData, defaultMonths, selectedKpi],
  )

  const conversionBarData = useMemo(() => {
    const data = dashboardData?.activeClients?.data ?? []
    return data.map((item) => item.monthValue ?? 0)
  }, [dashboardData])

  const barSeries = useMemo(
    () => [
      {
        name: t('newClients'),
        data:
          conversionBarData.length > 0
            ? conversionBarData
            : [95, 72, 105, 40, 63, 78],
      },
    ],
    [conversionBarData, t],
  )

  const totalNewCustomers = useMemo(() => {
    const data = barSeries[0]?.data ?? []
    return Math.round(
      data.reduce(
        (sum, value) => sum + (typeof value === 'number' ? value : 0),
        0,
      ),
    )
  }, [barSeries])

  const conversionRate = useMemo(() => {
    const value = dashboardData?.kpisResume?.conversion?.valor
    return typeof value === 'number' ? value : null
  }, [dashboardData])

  const barOptions = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'bar',
        toolbar: { show: false },
        foreColor: '#94a3b8',
      },
      colors: ['#75DFFF'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '50%',
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: 'rgba(148, 163, 184, 0.15)',
        strokeDashArray: 4,
      },
      xaxis: {
        categories: defaultConversionMonths,
      },
      yaxis: { labels: { formatter: (val: number) => `${Math.round(val)}` } },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) =>
            `${Math.round(val)} ${t('newClients').toLowerCase()}`,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          opacityFrom: 0.85,
          opacityTo: 0.5,
        },
      },
    }),
    [defaultConversionMonths, t],
  )

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      <div className="grid gap-6 min-[1000px]:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-md font-sans font-semibold text-white">
              {t('kpiEvolution')}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
              {(Object.keys(kpiLabelMap) as KpiKey[]).map((key) => {
                const isActive = selectedKpi === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKpi(key)}
                    className={
                      isActive
                        ? 'rounded-full border border-cyan-400/60 bg-cyan-400/20 px-3 py-1 text-cyan-100'
                        : 'rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-200 transition hover:border-white/30'
                    }
                  >
                    {kpiLabelMap[key]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-4">
            <ReactApexChart
              options={areaOptions}
              series={areaSeries}
              type="area"
              height={260}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-sm font-semibold text-white">
              {t('conversionRate')}
              <span className="text-white/70">&gt;</span>
            </h2>
            <div className="text-right text-xs text-slate-300">
              <div>
                {conversionRate !== null
                  ? `${conversionRate.toFixed(1)}%`
                  : '--'}
              </div>
              <div>
                {totalNewCustomers} {t('clients')}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ReactApexChart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={260}
            />
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-white">
            {t('mapTitle')}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
              {t('allLocations')}
            </button>
            <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
              {t('allTypes')}
            </button>
          </div>
        </div>
        <div
          ref={mapRef}
          className="relative mt-4 h-72 w-full overflow-hidden rounded-2xl border border-white/10"
        >
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute z-20 hidden rounded-lg bg-black/70 px-2 py-1 text-xs text-white backdrop-blur"
          />
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-x-3 gap-y-1.5 rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
            {MAP_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-1.5 text-[10px] text-slate-200"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <span>{getMapCategoryLabel(tMap, cat)}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-200">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: CATEGORY_COLORS.default }}
              />
              <span>{tMap('others')}</span>
            </div>
          </div>
        </div>
      </section>

      <ActiveClientsDataTable
        clients={dashboardData?.activeClients?.data ?? []}
        isPending={isDashboardPending}
        isFetching={isDashboardFetching}
        isError={isDashboardError}
      />
    </div>
  )
}
