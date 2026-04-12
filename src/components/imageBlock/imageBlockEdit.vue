<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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

const fileList = ref<UploadUserFile[]>([])
const formRef = ref<FormInstance>()
const config = ref<ImageBlockConfig>({ ...defaultConfig })
const rules: FormRules<ImageBlockConfig> = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  dataRef: [{ required: true, message: '请选择接口字段', trigger: 'change' }],
  alt: [{ required: true, message: '请填写图片说明', trigger: 'blur' }],
}

const handleChange: UploadProps['onChange'] = (uploadFile) => {
  if (!uploadFile.raw) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    config.value.fallbackUrl = result
    fileList.value = [{ name: uploadFile.name, url: result }]
  }
  reader.readAsDataURL(uploadFile.raw)
}

const handleRemove: UploadProps['onRemove'] = () => {
  fileList.value = []
  config.value.fallbackUrl = ''
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
    if (config.value.fallbackUrl) {
      fileList.value = [{ name: 'fallback-image', url: config.value.fallbackUrl }]
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
  ElMessage.success('图片组件配置已保存')
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="mb-6">
      <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Image Block</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">图片组件配置</h2>
      <p class="mt-2 text-sm leading-6 text-slate-500">
        `dataRef` 对应接口返回对象里的字段名。上传区用于配置兜底图片，接口没有返回 URL 时会显示它。
      </p>
    </div>

    <el-form ref="formRef" :model="config" :rules="rules" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="config.title" />
      </el-form-item>
      <el-form-item label="接口字段 dataRef" prop="dataRef">
        <el-select v-model="config.dataRef" class="w-full">
          <el-option label="场站全景图字段" value="sitePanoramaUrl" />
          <el-option label="充电桩照片字段" value="chargerPhotoUrl" />
          <el-option label="报告封面字段" value="reportCoverUrl" />
        </el-select>
      </el-form-item>
      <el-form-item label="图片说明 alt" prop="alt">
        <el-input v-model="config.alt" />
      </el-form-item>
      <el-form-item label="兜底图片上传">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          accept="image/*"
          :limit="1"
          :on-change="handleChange"
          :on-remove="handleRemove"
        >
          <div class="px-3 text-sm text-slate-600">选择图片</div>
        </el-upload>
      </el-form-item>
      <el-form-item class="mb-0">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
