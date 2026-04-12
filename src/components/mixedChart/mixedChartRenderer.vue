<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseEChart from '@/components/charts/BaseEChart.vue'
import type { BaseChartOption } from '@/components/charts/BaseEChart.vue'
interface MixedChartSeries {
  name: string
  type: 'bar' | 'line'
  data: number[]
  yAxisIndex?: number
  color?: string
  smooth?: boolean
}

interface MixedChartDataset {
  categories: string[]
  series: MixedChartSeries[]
}

interface MixedChartConfig {
  title: string
  dataRef: string
  yAxisCount: 1 | 2
  enableXAxisFilter: boolean
  xName: string
  yName: string
  ySecondaryName: string
}

const STORAGE_KEY = 'report-builder:mixed-chart-config'
const UPDATE_EVENT = 'report-builder:mixed-chart-updated'
const defaultConfig: MixedChartConfig = {
  title: '全国充电站经营趋势',
  dataRef: 'nationwideUtilization',
  yAxisCount: 2,
  enableXAxisFilter: true,
  xName: '时间',
  yName: '业务指标',
  ySecondaryName: '百分比',
}

const dataCatalog: Record<string, MixedChartDataset> = {
  nationwideUtilization: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      { name: '充电量', type: 'bar', data: [320, 368, 410, 452, 498, 530], color: '#2f6fed' },
      { name: '订单数', type: 'bar', data: [2100, 2280, 2410, 2680, 2960, 3150], color: '#7cc7ff' },
      { name: '可利用率', type: 'line', data: [91, 92, 93, 94, 95, 96], yAxisIndex: 1, color: '#16a34a' },
    ],
  },
  eastRegionHealth: {
    categories: ['上海', '杭州', '苏州', '南京', '宁波', '合肥'],
    series: [
      { name: '在线桩数', type: 'bar', data: [460, 438, 410, 356, 332, 298], color: '#ff9f43' },
      { name: '告警数', type: 'bar', data: [42, 38, 36, 33, 29, 24], color: '#ff6b6b' },
      { name: '在线率', type: 'line', data: [97, 96, 95, 95, 94, 94], yAxisIndex: 1, color: '#5b8ff9' },
    ],
  },
}

const config = ref<MixedChartConfig>({ ...defaultConfig })

const pendingFilterValue = ref('')
const appliedFilterValue = ref('')

const filterOptions = computed(() =>
  activeDataset.value.categories.map((category) => ({
    label: category,
    value: category,
  }))
)

const filteredDataset = computed<MixedChartDataset>(() => {
  if (!appliedFilterValue.value) {
    return activeDataset.value
  }

  const categoryIndex = activeDataset.value.categories.findIndex(
    (category) => category === appliedFilterValue.value
  )

  if (categoryIndex === -1) {
    return activeDataset.value
  }

  return {
    categories: [activeDataset.value.categories[categoryIndex]],
    series: activeDataset.value.series.map((series) => ({
      ...series,
      data: [series.data[categoryIndex]],
    })),
  }
})

const activeDataset = computed(
  () => dataCatalog[config.value.dataRef] ?? dataCatalog.nationwideUtilization
)

watch(
  () => activeDataset.value.categories,
  (categories) => {
    const firstOption = categories[0] ?? ''
    pendingFilterValue.value = firstOption

    if (appliedFilterValue.value && !categories.includes(appliedFilterValue.value)) {
      appliedFilterValue.value = ''
    }
  },
  {
    immediate: true,
  }
)

function applyFilter() {
  appliedFilterValue.value = pendingFilterValue.value
}

function resetFilter() {
  pendingFilterValue.value = activeDataset.value.categories[0] ?? ''
  appliedFilterValue.value = ''
}

function loadConfig() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    config.value = { ...defaultConfig }
    return
  }

  try {
    config.value = {
      ...defaultConfig,
      ...JSON.parse(stored),
    }
  } catch {
    config.value = { ...defaultConfig }
  }
}

const chartOption = computed<BaseChartOption>(() => {
  const secondaryAxisEnabled = config.value.yAxisCount === 2

  return {
    color: ['#2f6fed', '#3fb27f', '#ff9f43', '#ff5d73'],
    title: {
      text: config.value.title,
      left: 20,
      top: 12,
      textStyle: {
        color: '#11203b',
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
      type: 'shadow',
      },
    },
    legend: {
      top: 14,
      right: 20,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#42526b',
      },
    },
    grid: {
      top: 68,
      left: 56,
      right: secondaryAxisEnabled ? 64 : 28,
      bottom: 56,
    },
    xAxis: {
      type: 'category',
      name: config.value.xName,
      nameLocation: 'middle',
      nameGap: 34,
      data: filteredDataset.value.categories,
      axisTick: {
        alignWithLabel: true,
      },
      axisLine: {
        lineStyle: {
          color: '#cad3e0',
        },
      },
      axisLabel: {
        color: '#5f6f86',
      },
    },
    yAxis: secondaryAxisEnabled
      ? [
          {
            type: 'value',
            name: config.value.yName,
            nameTextStyle: {
              color: '#5f6f86',
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#cad3e0',
              },
            },
            splitLine: {
              lineStyle: {
                color: '#e6ebf2',
              },
            },
            axisLabel: {
              color: '#5f6f86',
            },
          },
          {
            type: 'value',
            name: config.value.ySecondaryName || '副轴',
            nameTextStyle: {
              color: '#5f6f86',
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#cad3e0',
              },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#5f6f86',
            },
          },
        ]
      : {
          type: 'value',
          name: config.value.yName,
          nameTextStyle: {
            color: '#5f6f86',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#cad3e0',
            },
          },
          splitLine: {
            lineStyle: {
              color: '#e6ebf2',
            },
          },
          axisLabel: {
            color: '#5f6f86',
          },
        },
    series: filteredDataset.value.series.map((series) => ({
      name: series.name,
      type: series.type,
      data: series.data,
      yAxisIndex: secondaryAxisEnabled ? (series.yAxisIndex ?? 0) : 0,
      smooth: series.type === 'line' ? (series.smooth ?? true) : false,
      barMaxWidth: series.type === 'bar' ? 28 : undefined,
      itemStyle: series.color
        ? {
            color: series.color,
          }
        : undefined,
      emphasis: {
        focus: 'series',
      },
    })),
  }
})

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
  <div class="grid gap-4">
    <div
      v-if="config.enableXAxisFilter"
      class="flex flex-wrap items-center gap-3"
    >
      <el-select
        v-model="pendingFilterValue"
        placeholder="请选择筛选项"
        class="!w-[240px]"
      >
        <el-option
          v-for="option in filterOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <div class="flex items-center gap-3">
        <el-button type="primary" @click="applyFilter">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
    </div>

    <BaseEChart :option="chartOption" height="420px" />
  </div>
</template>
