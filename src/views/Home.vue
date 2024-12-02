<template>
  <div class="home">
    <h1>Amazon Tools Web</h1>
    <div class="settings">
      <el-button @click="showChangeKeyDialog" size="small">
        Change AES Key
      </el-button>
    </div>
    <div class="navigation-buttons">
      <el-button type="primary" @click="$router.push('/budget')">
        Budget Management
      </el-button>
      <el-button type="primary" @click="$router.push('/bids')">
        Bid Management
      </el-button>
    </div>
    <el-dialog
      v-model="changeKeyDialogVisible"
      title="Change AES Key"
      width="400px"
    >
      <el-form @submit.prevent="handleKeyChange">
        <el-form-item>
          <el-input
            v-model="newKey"
            type="password"
            placeholder="Enter new AES key"
            show-password
            :maxlength="44"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeKeyDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleKeyChange" :disabled="!isValidKey || !isBase64">
          Change Key
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const changeKeyDialogVisible = ref(false)
const newKey = ref('')

const isValidKey = computed(() => newKey.value.length === 44)
const isBase64 = computed(() => {
  try {
    return btoa(atob(newKey.value)) === newKey.value
  } catch {
    return false
  }
})

const showChangeKeyDialog = () => {
  changeKeyDialogVisible.value = true
  newKey.value = ''
}

const handleKeyChange = () => {
  if (isValidKey.value && isBase64.value) {
    localStorage.setItem('aesKey', newKey.value)
    changeKeyDialogVisible.value = false
    window.location.reload()
  }
}
</script>

<style lang="scss" scoped>
@use "@/styles/mixins" as *;

.home {
  padding: 2rem;
  text-align: center;

  h1 {
    margin-bottom: 2rem;
  }

  .navigation-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;

    .el-button {
      min-width: 200px;
      
      @include respond-to("md") {
        width: 100%;
      }
    }
  }

  .settings {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style> 