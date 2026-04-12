<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface ChargeTableConfig {
  title: string
  dataRef: string
  columnLabels: {
    boxNo: string
    historyChargeEnergy: string
    weeklyChargeEnergy: string
    monthlyChargeEnergy: string
    availability: string
    utilizationRate: string
    averagePower: string
  }
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

const formRef = ref<FormInstance>()
const config = ref<ChargeTableConfig>({ ...defaultConfig })

const rules: FormRules<ChargeTableConfig> = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  dataRef: [{ required: true, message: '请选择数据源', trigger: 'change' }],
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
      columnLabels: {
        ...defaultConfig.columnLabels,
        ...JSON.parse(stored).columnLabels,
      },
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
  ElMessage.success('表格配置已保存')
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6">
      <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Charge Table</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">表格配置</h2>
    </div>

    <el-form
      ref="formRef"
      :model="config"
      :rules="rules"
      label-width="140px"
      label-position="left"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="config.title" placeholder="请输入表格标题" />
      </el-form-item>

      <el-form-item label="数据源 dataRef" prop="dataRef">
        <el-input v-model="config.dataRef" placeholder="请输入数据源标识" />
      </el-form-item>

      <el-form-item label="箱号列">
        <el-input v-model="config.columnLabels.boxNo" />
      </el-form-item>
      <el-form-item label="历史充电电量列">
        <el-input v-model="config.columnLabels.historyChargeEnergy" />
      </el-form-item>
      <el-form-item label="本周充电电量列">
        <el-input v-model="config.columnLabels.weeklyChargeEnergy" />
      </el-form-item>
      <el-form-item label="本月充电电量列">
        <el-input v-model="config.columnLabels.monthlyChargeEnergy" />
      </el-form-item>
      <el-form-item label="可利用率列">
        <el-input v-model="config.columnLabels.availability" />
      </el-form-item>
      <el-form-item label="使用率列">
        <el-input v-model="config.columnLabels.utilizationRate" />
      </el-form-item>
      <el-form-item label="平均功率列">
        <el-input v-model="config.columnLabels.averagePower" />
      </el-form-item>

      <el-form-item class="mb-0">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
