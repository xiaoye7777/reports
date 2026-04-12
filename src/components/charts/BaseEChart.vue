<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  CanvasRenderer,
} from 'echarts/renderers'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import type { ComposeOption, ECharts, SetOptionOpts } from 'echarts/core'
import type {
  BarSeriesOption,
  LineSeriesOption,
} from 'echarts/charts'
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
])

export type BaseChartOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | DatasetComponentOption
  | GridComponentOption
  | LegendComponentOption
  | TitleComponentOption
  | TooltipComponentOption
>

const props = withDefaults(
  defineProps<{
    option: BaseChartOption
    height?: string
    width?: string
    autoresize?: boolean
    notMerge?: boolean
    lazyUpdate?: boolean
  }>(),
  {
    height: '420px',
    width: '100%',
    autoresize: true,
    notMerge: false,
    lazyUpdate: false,
  }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const chartStyle = computed(() => ({
  height: props.height,
  width: props.width,
}))

function renderChart() {
  if (!chartRef.value) {
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const setOptionConfig: SetOptionOpts = {
    notMerge: props.notMerge,
    lazyUpdate: props.lazyUpdate,
  }

  chartInstance.setOption(props.option, setOptionConfig)
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  () => props.option,
  () => {
    renderChart()
  },
  {
    deep: true,
  }
)

onMounted(() => {
  renderChart()

  if (props.autoresize && chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartRef.value)
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div ref="chartRef" :style="chartStyle" />
</template>
