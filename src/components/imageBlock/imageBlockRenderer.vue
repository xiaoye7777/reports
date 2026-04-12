<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface ImageBlockConfig {
  title: string
  dataRef: string
  alt: string
  fallbackUrl: string
}

const STORAGE_KEY = 'report-builder:image-block-config'
const UPDATE_EVENT = 'report-builder:image-block-updated'
const defaultConfig: ImageBlockConfig = {
  title: '场站实景图',
  dataRef: 'sitePanoramaUrl',
  alt: '充电站现场图片',
  fallbackUrl: '',
}

const apiData: Record<string, string | undefined> = {
  sitePanoramaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  chargerPhotoUrl: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1200&q=80',
  reportCoverUrl: undefined,
}

const config = ref<ImageBlockConfig>({ ...defaultConfig })
const imageUrl = computed(() => apiData[config.value.dataRef] || config.value.fallbackUrl)

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
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Image Preview</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">{{ config.title }}</h2>
      </div>
      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        当前字段：<span class="font-medium text-slate-900">{{ config.dataRef }}</span>
      </div>
    </div>

    <div
      class="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,_#f8fbff,_#eef4fb)]"
      :style="{ height: '360px' }"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="config.alt || config.title"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center px-6 text-center text-sm leading-6 text-slate-500"
      >
        当前接口字段没有返回图片 URL，且尚未上传兜底图片。
      </div>
    </div>
  </section>
</template>
