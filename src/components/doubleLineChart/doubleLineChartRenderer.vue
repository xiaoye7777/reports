<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseEChart from '@/components/charts/BaseEChart.vue'
import type { BaseChartOption } from '@/components/charts/BaseEChart.vue'
interface DoubleLineChartSeries {
  name: string
  data: number[]
  layer: 'top' | 'bottom'
  yAxisIndex: 0 | 1 | 2 | 3
  color?: string
  smooth?: boolean
}

interface DoubleLineChartDataset {
  categories: string[]
  series: DoubleLineChartSeries[]
}

interface DoubleLineChartConfig {
  title: string
  dataRef: string
  xName: string
  topLeftYName: string
  topRightYName: string
  bottomLeftYName: string
  bottomRightYName: string
}

const STORAGE_KEY = 'report-builder:double-line-chart-config'
const UPDATE_EVENT = 'report-builder:double-line-chart-updated'
const defaultConfig: DoubleLineChartConfig = {
  title: '网络运营双层折线图',
  dataRef: 'networkOverview',
  xName: '时间',
  topLeftYName: '在线桩数',
  topRightYName: '告警数',
  bottomLeftYName: '充电量',
  bottomRightYName: '利用率',
}

const dataCatalog: Record<string, DoubleLineChartDataset> = {
  networkOverview: {
    categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [
      { name: '在线桩数', layer: 'top', yAxisIndex: 0, data: [420, 426, 431, 438, 442, 447, 452], color: '#2f6fed' },
      { name: '告警数', layer: 'top', yAxisIndex: 1, data: [22, 19, 24, 18, 16, 14, 13], color: '#ff8a4c' },
      { name: '充电量', layer: 'bottom', yAxisIndex: 2, data: [8600, 9030, 9180, 9670, 10120, 10480, 10960], color: '#16a34a' },
      { name: '利用率', layer: 'bottom', yAxisIndex: 3, data: [62, 64, 65, 68, 69, 71, 73], color: '#7c4dff' },
    ],
  },
  stationCluster: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      { name: '站点数', layer: 'top', yAxisIndex: 0, data: [112, 115, 118, 124, 129, 132], color: '#2f6fed' },
      { name: '异常站点', layer: 'top', yAxisIndex: 1, data: [12, 10, 11, 9, 8, 7], color: '#ff8a4c' },
      { name: '月充电量', layer: 'bottom', yAxisIndex: 2, data: [128000, 136000, 142000, 151000, 158000, 166000], color: '#16a34a' },
      { name: '平均利用率', layer: 'bottom', yAxisIndex: 3, data: [55, 57, 58, 60, 63, 65], color: '#7c4dff' },
    ],
  },
}

const config = ref<DoubleLineChartConfig>({ ...defaultConfig })
const activeDataset = computed(() => dataCatalog[config.value.dataRef] ?? dataCatalog.networkOverview)

const chartOption = computed<BaseChartOption>(() => ({
  color: ['#2f6fed', '#ff8a4c', '#16a34a', '#7c4dff'],
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
  legend: {
    top: 14,
    right: 20,
    itemWidth: 12,
    itemHeight: 12,
    textStyle: {
      color: '#42526b',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      link: [
        {
          xAxisIndex: [0, 1],
        },
      ],
    },
  },
  axisPointer: {
    link: [
      {
        xAxisIndex: [0, 1],
      },
    ],
  },
  grid: [
    {
      top: 76,
      left: 64,
      right: 64,
      height: '30%',
    },
    {
      top: '56%',
      left: 64,
      right: 64,
      height: '24%',
    },
  ],
  xAxis: [
    {
      type: 'category',
      gridIndex: 0,
      data: activeDataset.value.categories,
      boundaryGap: false,
      axisTick: {
        alignWithLabel: true,
      },
      axisLine: {
        lineStyle: {
          color: '#cad3e0',
        },
      },
      axisLabel: {
        show: false,
      },
    },
    {
      type: 'category',
      gridIndex: 1,
      data: activeDataset.value.categories,
      boundaryGap: false,
      name: config.value.xName,
      nameLocation: 'middle',
      nameGap: 34,
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
  ],
  yAxis: [
    {
      type: 'value',
      gridIndex: 0,
      position: 'left',
      name: config.value.topLeftYName,
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
      gridIndex: 0,
      position: 'right',
      name: config.value.topRightYName,
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
    {
      type: 'value',
      gridIndex: 1,
      position: 'left',
      name: config.value.bottomLeftYName,
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
      gridIndex: 1,
      position: 'right',
      name: config.value.bottomRightYName,
      nameTextStyle: {
        color: '#5f6f86',
      },
      nameGap: 26,
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
  ],
  series: activeDataset.value.series.map((series) => ({
    name: series.name,
    type: 'line',
    smooth: series.smooth ?? true,
    data: series.data,
    xAxisIndex: series.layer === 'top' ? 0 : 1,
    yAxisIndex: series.yAxisIndex,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: series.color
      ? {
          color: series.color,
          width: 3,
        }
      : {
          width: 3,
        },
    itemStyle: series.color
      ? {
          color: series.color,
        }
      : undefined,
    emphasis: {
      focus: 'series',
    },
  })),
}))

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
  <BaseEChart :option="chartOption" height="560px" />
</template>
