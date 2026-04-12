<script setup lang="ts">
import ChargeTableEdit from '@/components/chargeTable/chargeTableEdit.vue'
import ChargeTableRenderer from '@/components/chargeTable/chargeTableRenderer.vue'
import DoubleLineChartEdit from '@/components/doubleLineChart/doubleLineChartEdit.vue'
import DoubleLineChartRenderer from '@/components/doubleLineChart/doubleLineChartRenderer.vue'
import ImageBlockEdit from '@/components/imageBlock/imageBlockEdit.vue'
import ImageBlockRenderer from '@/components/imageBlock/imageBlockRenderer.vue'
import MixedChartEdit from '@/components/mixedChart/mixedChartEdit.vue'
import MixedChartRenderer from '@/components/mixedChart/mixedChartRenderer.vue'
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#edf4ff_38%,_#f6f8fc_100%)] px-6 py-10 text-slate-900">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section class="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <p class="text-sm uppercase tracking-[0.3em] text-sky-200/80">Report Builder</p>
        <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <h1 class="text-4xl font-semibold tracking-tight">混合柱状图 / 折线图模块设计台</h1>
            <p class="mt-4 text-sm leading-7 text-slate-300">
              这页先把图表模块的“配置编辑”和“结果渲染”拆开。后面你做饼图、PDF 模块、文本模块时，也可以沿用同样的目录组织方式。
            </p>
          </div>
          <div class="grid gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
            <span>目录规范：components/&lt;module&gt;/edit + renderer</span>
            <span>当前模块：mixedChart</span>
          </div>
        </div>
      </section>

      <section class="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <MixedChartEdit />

        <div class="grid gap-6">
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <MixedChartRenderer />
          </section>
        </div>
      </section>

      <section class="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ChargeTableEdit />
        <ChargeTableRenderer />
      </section>

      <section class="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <DoubleLineChartEdit />
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <DoubleLineChartRenderer />
        </section>
      </section>

      <section class="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ImageBlockEdit />
        <ImageBlockRenderer />
      </section>
    </div>
  </main>
</template>
