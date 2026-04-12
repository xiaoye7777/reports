<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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

const formRef = ref<FormInstance>()
const config = ref<MixedChartConfig>({ ...defaultConfig })

const rules: FormRules<MixedChartConfig> = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  dataRef: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  xName: [{ required: true, message: '请填写 X 轴名称', trigger: 'blur' }],
  yName: [{ required: true, message: '请填写主 Y 轴名称', trigger: 'blur' }],
  ySecondaryName: [
    {
      validator: (_rule, value, callback) => {
        if (config.value.yAxisCount === 2 && !String(value || '').trim()) {
          callback(new Error('双 Y 轴时请填写副 Y 轴名称'))
          return
        }

        callback()
      },
      trigger: 'blur',
    },
  ],
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
}

function loadConfig() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    saveConfig()
    return
  }

  try {
    config.value = {
      ...defaultConfig,
      ...JSON.parse(stored),
    }
  } catch {
    config.value = { ...defaultConfig }
    saveConfig()
  }
}

async function handleConfirm() {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    ElMessage.warning('请先补全必填项')
    return
  }

  saveConfig()
  ElMessage.success('混合图配置已保存')
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6">
      <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Mixed Chart</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">混合图配置</h2>
    </div>

    <el-form ref="formRef" :model="config" :rules="rules" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="config.title" placeholder="请输入图表标题" />
      </el-form-item>

      <el-form-item label="数据源 dataRef" prop="dataRef">
        <el-select v-model="config.dataRef" placeholder="请选择数据源" class="w-full">
          <el-option label="全国经营趋势" value="nationwideUtilization" />
          <el-option label="华东区域健康度" value="eastRegionHealth" />
        </el-select>
      </el-form-item>

      <el-form-item label="Y 轴数量" prop="yAxisCount">
        <el-select v-model="config.yAxisCount" placeholder="请选择 Y 轴数量" class="w-full">
          <el-option label="1 个 Y 轴" :value="1" />
          <el-option label="2 个 Y 轴" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否显示 X 轴筛选">
        <el-switch v-model="config.enableXAxisFilter" />
      </el-form-item>

      <el-form-item label="X 轴名称" prop="xName">
        <el-input v-model="config.xName" placeholder="请输入 X 轴名称" />
      </el-form-item>

      <el-form-item label="主 Y 轴名称" prop="yName">
        <el-input v-model="config.yName" placeholder="请输入主 Y 轴名称" />
      </el-form-item>

      <el-form-item label="副 Y 轴名称" prop="ySecondaryName">
        <el-input
          v-model="config.ySecondaryName"
          :disabled="config.yAxisCount === 1"
          placeholder="请输入副 Y 轴名称"
        />
      </el-form-item>

      <el-form-item class="mb-0">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
