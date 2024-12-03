<template>
  <el-dialog
    v-model="visible"
    title="Enter AES Key"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :width="dialogWidth"
  >
    <div class="description">
      Please enter your Base64 encoded AES key (44 characters)
    </div>
    <el-form @submit.prevent="handleSubmit">
      <el-form-item>
        <el-input
          v-model="aesKey"
          type="password"
          placeholder="Please enter your AES key"
          show-password
          :maxlength="44"
          @input="validateKey"
        />
      </el-form-item>
      <div class="key-validation" :class="{ error: keyError }">
        {{ keyError || 'Key must be exactly 44 characters (Base64 encoded)' }}
      </div>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleSubmit" :disabled="!isValidKey || !isBase64">
        Submit
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(true)
const aesKey = ref('')
const keyError = ref('')

const isValidKey = computed(() => aesKey.value.length === 44)
const isBase64 = computed(() => {
  try {
    return btoa(atob(aesKey.value)) === aesKey.value
  } catch {
    return false
  }
})

const validateKey = () => {
  if (aesKey.value.length > 44) {
    aesKey.value = aesKey.value.slice(0, 44)
  }
  if (aesKey.value.length < 44) {
    keyError.value = `Key length: ${aesKey.value.length}/44`
  } else if (!isBase64.value) {
    keyError.value = 'Invalid Base64 format'
  } else {
    keyError.value = ''
  }
}

const handleSubmit = () => {
  if (isValidKey.value && isBase64.value) {
    console.log('Saving key to localStorage:', aesKey.value)
    localStorage.setItem('aesKey', aesKey.value)
    visible.value = false
    console.log('Reloading page...')
    window.location.reload()
  }
}

// Add responsive dialog width
const dialogWidth = window.innerWidth <= 768 ? '90%' : '500px'
</script>

<style scoped>
.description {
  margin-bottom: 1rem;
  color: #666;
}

.key-validation {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.key-validation.error {
  color: #f56c6c;
}
</style> 