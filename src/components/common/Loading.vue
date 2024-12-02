<template>
  <div class="loading-overlay" v-if="visible">
    <el-loading />
  </div>
</template>

<script setup>
import { ElLoading } from 'element-plus'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style> 