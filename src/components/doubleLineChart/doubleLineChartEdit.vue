<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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

const formRef = ref<FormInstance>()
const config = ref<DoubleLineChartConfig>({ ...defaultConfig })
const rules: FormRules<DoubleLineChartConfig> = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  dataRef: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  xName: [{ required: true, message: '请填写 X 轴名称', trigger: 'blur' }],
  topLeftYName: [{ required: true, message: '请填写上层左轴名称', trigger: 'blur' }],
  topRightYName: [{ required: true, message: '请填写上层右轴名称', trigger: 'blur' }],
  bottomLeftYName: [{ required: true, message: '请填写下层左轴名称', trigger: 'blur' }],
  bottomRightYName: [{ required: true, message: '请填写下层右轴名称', trigger: 'blur' }],
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
  ElMessage.success('双层折线图配置已保存')
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6">
      <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Double Line Chart</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">双层折线图配置</h2>
      <p class="mt-2 text-sm leading-6 text-slate-500">
        上下两层折线图共用图例和 X 轴类目，每层左右各一个 Y 轴，总共四个 Y 轴。
      </p>
    </div>

    <el-form ref="formRef" :model="config" :rules="rules" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="config.title" />
      </el-form-item>
      <el-form-item label="数据源 dataRef" prop="dataRef">
        <el-select v-model="config.dataRef" class="w-full">
          <el-option label="网络运营概览" value="networkOverview" />
          <el-option label="站群月度趋势" value="stationCluster" />
        </el-select>
      </el-form-item>
      <el-form-item label="X 轴名称" prop="xName">
        <el-input v-model="config.xName" />
      </el-form-item>
      <el-form-item label="上层左轴名称" prop="topLeftYName">
        <el-input v-model="config.topLeftYName" />
      </el-form-item>
      <el-form-item label="上层右轴名称" prop="topRightYName">
        <el-input v-model="config.topRightYName" />
      </el-form-item>
      <el-form-item label="下层左轴名称" prop="bottomLeftYName">
        <el-input v-model="config.bottomLeftYName" />
      </el-form-item>
      <el-form-item label="下层右轴名称" prop="bottomRightYName">
        <el-input v-model="config.bottomRightYName" />
      </el-form-item>
      <el-form-item class="mb-0">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
