<template>
  <router-view v-if="!showKeyDialog" />
  <AESKeyDialog v-if="showKeyDialog" />
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import AESKeyDialog from './components/common/AESKeyDialog.vue'

const showKeyDialog = ref(false)

onBeforeMount(() => {
  const storedKey = localStorage.getItem('aesKey')
  const isValidKey = storedKey && storedKey.length === 44 && (() => {
    try {
      return btoa(atob(storedKey)) === storedKey
    } catch {
      return false
    }
  })()

  console.log('isValidKey', isValidKey)
  if (!isValidKey) {
    localStorage.removeItem('aesKey')
    console.log('Invalid key, showing dialog')
    showKeyDialog.value = true
  }
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

body.el-popup-parent--hidden {
  overflow: hidden;
}
</style>
