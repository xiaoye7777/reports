<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TableColumnCtx, Sort } from 'element-plus'
interface ChargeTableRow {
  boxNo: string
  historyChargeEnergy: number
  weeklyChargeEnergy: number
  monthlyChargeEnergy: number
  availability: number
  utilizationRate: number
  averagePower: number
}

interface ChargeTableColumn {
  key: keyof ChargeTableRow
  label: string
  sortable?: boolean
}

interface ChargeTableConfig {
  title: string
  dataRef: string
  columnLabels: Record<keyof ChargeTableRow, string>
}

const STORAGE_KEY = 'report-builder:charge-table-config'
const UPDATE_EVENT = 'report-builder:charge-table-updated'
const defaultConfig: ChargeTableConfig = {
  title: '充电箱运营数据表',
  dataRef: 'stationAlpha',
  columnLabels: {
    boxNo: '箱号',
    historyChargeEnergy: '历史充电电量',
    weeklyChargeEnergy: '本周充电电量',
    monthlyChargeEnergy: '本月充电电量',
    availability: '可利用率',
    utilizationRate: '使用率',
    averagePower: '平均功率',
  },
}

const dataCatalog: Record<string, ChargeTableRow[]> = {
  stationAlpha: [
    { boxNo: 'BOX-001', historyChargeEnergy: 126530, weeklyChargeEnergy: 4210, monthlyChargeEnergy: 16980, availability: 98.2, utilizationRate: 74.5, averagePower: 112.6 },
    { boxNo: 'BOX-002', historyChargeEnergy: 118240, weeklyChargeEnergy: 3960, monthlyChargeEnergy: 15430, availability: 97.4, utilizationRate: 69.3, averagePower: 109.8 },
    { boxNo: 'BOX-003', historyChargeEnergy: 130860, weeklyChargeEnergy: 4480, monthlyChargeEnergy: 17320, availability: 99.1, utilizationRate: 78.2, averagePower: 116.4 },
    { boxNo: 'BOX-004', historyChargeEnergy: 109720, weeklyChargeEnergy: 3520, monthlyChargeEnergy: 14810, availability: 95.8, utilizationRate: 63.9, averagePower: 104.1 },
    { boxNo: 'BOX-005', historyChargeEnergy: 122310, weeklyChargeEnergy: 4095, monthlyChargeEnergy: 16150, availability: 98.6, utilizationRate: 71.8, averagePower: 111.2 },
  ],
  stationBeta: [
    { boxNo: 'CAB-101', historyChargeEnergy: 98620, weeklyChargeEnergy: 3150, monthlyChargeEnergy: 12880, availability: 96.3, utilizationRate: 61.2, averagePower: 99.4 },
    { boxNo: 'CAB-102', historyChargeEnergy: 103450, weeklyChargeEnergy: 3340, monthlyChargeEnergy: 13360, availability: 97.2, utilizationRate: 64.7, averagePower: 101.6 },
    { boxNo: 'CAB-103', historyChargeEnergy: 110230, weeklyChargeEnergy: 3610, monthlyChargeEnergy: 14050, availability: 98.1, utilizationRate: 68.5, averagePower: 106.8 },
    { boxNo: 'CAB-104', historyChargeEnergy: 94770, weeklyChargeEnergy: 3020, monthlyChargeEnergy: 12490, availability: 95.4, utilizationRate: 59.1, averagePower: 96.2 },
  ],
}

const config = ref<ChargeTableConfig>({ ...defaultConfig })

const filterValue = ref('')
const appliedFilterValue = ref('')
const sortState = ref<{
  prop: keyof ChargeTableRow | ''
  order: Sort['order'] | null
}>({
  prop: '',
  order: null,
})

const activeRows = computed(() => dataCatalog[config.value.dataRef] ?? dataCatalog.stationAlpha)

const columns = computed<ChargeTableColumn[]>(() => [
  { key: 'boxNo', label: config.value.columnLabels.boxNo, sortable: true },
  { key: 'historyChargeEnergy', label: config.value.columnLabels.historyChargeEnergy, sortable: true },
  { key: 'weeklyChargeEnergy', label: config.value.columnLabels.weeklyChargeEnergy, sortable: true },
  { key: 'monthlyChargeEnergy', label: config.value.columnLabels.monthlyChargeEnergy, sortable: true },
  { key: 'availability', label: config.value.columnLabels.availability, sortable: true },
  { key: 'utilizationRate', label: config.value.columnLabels.utilizationRate, sortable: true },
  { key: 'averagePower', label: config.value.columnLabels.averagePower, sortable: true },
])

const visibleColumnKeys = ref<Array<keyof ChargeTableRow>>(
  columns.value.map((column) => column.key)
)

const boxOptions = computed(() =>
  activeRows.value.map((row) => ({
    label: row.boxNo,
    value: row.boxNo,
  }))
)

const visibleColumns = computed(() =>
  columns.value.filter((column) => visibleColumnKeys.value.includes(column.key))
)

const filteredRows = computed(() => {
  if (!appliedFilterValue.value) {
    return activeRows.value
  }

  return activeRows.value.filter((row) => row.boxNo === appliedFilterValue.value)
})

const displayRows = computed(() => {
  const rows = [...filteredRows.value]
  const { prop, order } = sortState.value

  if (!prop || !order) {
    return rows
  }

  return rows.sort((left, right) => {
    const leftValue = left[prop]
    const rightValue = right[prop]

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return order === 'ascending' ? leftValue - rightValue : rightValue - leftValue
    }

    return order === 'ascending'
      ? String(leftValue).localeCompare(String(rightValue), 'zh-CN')
      : String(rightValue).localeCompare(String(leftValue), 'zh-CN')
  })
})

function applyFilter() {
  appliedFilterValue.value = filterValue.value
}

function resetFilter() {
  filterValue.value = ''
  appliedFilterValue.value = ''
}

function handleSortChange({
  prop,
  order,
}: {
  column: TableColumnCtx<ChargeTableRow>
  prop: string
  order: Sort['order']
}) {
  sortState.value = {
    prop: (prop as keyof ChargeTableRow) || '',
    order,
  }
}

function formatCellValue(columnKey: keyof ChargeTableRow, value: ChargeTableRow[keyof ChargeTableRow]) {
  if (columnKey === 'availability' || columnKey === 'utilizationRate') {
    return `${value}%`
  }

  if (typeof value === 'number') {
    return value.toLocaleString('zh-CN')
  }

  return value
}

function loadConfig() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    config.value = { ...defaultConfig }
    return
  }

  try {
    const parsed = JSON.parse(stored)
    config.value = {
      ...defaultConfig,
      ...parsed,
      columnLabels: {
        ...defaultConfig.columnLabels,
        ...parsed.columnLabels,
      },
    }
  } catch {
    config.value = { ...defaultConfig }
  }
}

function handleConfigUpdate() {
  loadConfig()
}

onMounted(() => {
  loadConfig()
  window.addEventListener(UPDATE_EVENT, handleConfigUpdate)
  window.addEventListener('storage', handleConfigUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener(UPDATE_EVENT, handleConfigUpdate)
  window.removeEventListener('storage', handleConfigUpdate)
})
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Table Preview</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">{{ config.title }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          支持箱号筛选、查询与重置、整列排序，以及通过设置面板控制列显隐。
        </p>
      </div>

      <el-popover placement="bottom-end" trigger="click" :width="260">
        <template #reference>
          <button
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M10.325 4.317a1.724 1.724 0 0 1 3.35 0l.18.813a1.724 1.724 0 0 0 2.573 1.123l.718-.413a1.724 1.724 0 0 1 2.287.63l.042.074a1.724 1.724 0 0 1-.63 2.286l-.718.414a1.724 1.724 0 0 0-.85 2.213l.318.77a1.724 1.724 0 0 0 .85.93l.718.414a1.724 1.724 0 0 1 .63 2.286l-.042.074a1.724 1.724 0 0 1-2.287.63l-.718-.413a1.724 1.724 0 0 0-2.573 1.123l-.18.813a1.724 1.724 0 0 1-3.35 0l-.18-.813a1.724 1.724 0 0 0-2.573-1.123l-.718.413a1.724 1.724 0 0 1-2.287-.63l-.042-.074a1.724 1.724 0 0 1 .63-2.286l.718-.414a1.724 1.724 0 0 0 .85-.93l.318-.77a1.724 1.724 0 0 0-.85-2.213l-.718-.414a1.724 1.724 0 0 1-.63-2.286l.042-.074a1.724 1.724 0 0 1 2.287-.63l.718.413a1.724 1.724 0 0 0 2.573-1.123l.18-.813Z"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.6"
              />
              <circle
                cx="12"
                cy="12"
                r="3.1"
                stroke="currentColor"
                stroke-width="1.6"
              />
            </svg>
          </button>
        </template>

        <div class="grid gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">列展示设置</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">勾选要在表格中显示的列。</p>
          </div>
          <el-checkbox-group v-model="visibleColumnKeys" class="grid gap-2">
            <el-checkbox
              v-for="column in columns"
              :key="column.key"
              :value="column.key"
            >
              {{ column.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-popover>
    </div>

    <div class="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:flex-row md:items-end md:justify-between">
      <div class="flex min-w-[240px] flex-col gap-2">
        <label class="text-sm font-medium text-slate-700">{{ config.columnLabels.boxNo }}筛选</label>
        <el-select
          v-model="filterValue"
          clearable
          filterable
          placeholder="请选择箱号"
        >
          <el-option
            v-for="option in boxOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <div class="flex items-center gap-3">
        <el-button type="primary" @click="applyFilter">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
    </div>

    <el-table
      :data="displayRows"
      border
      stripe
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.key"
        :prop="column.key"
        :label="column.label"
        :sortable="column.sortable ? 'custom' : false"
        min-width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatCellValue(column.key, row[column.key]) }}
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>
