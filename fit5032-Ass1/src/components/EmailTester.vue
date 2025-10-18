<template>
  <div class="card p-3">
    <h5 class="mb-3">Send Email (SendGrid via Cloud Functions)</h5>
    <input v-model="to" type="email" placeholder="Recipient email" class="form-control mb-2" required>
    <textarea v-model="text" class="form-control mb-2" placeholder="Message..."></textarea>

    <div class="mb-2">
      <input type="file" @change="onPick" class="form-control">
      <small v-if="fileName">Attachment: {{ fileName }}</small>
    </div>

    <button class="btn btn-primary" :disabled="loading" @click="send">Send</button>
    <span class="ms-3" v-if="msg">{{ msg }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const to = ref('')
const text = ref('Hello from NFP Nutrition!')
const fileName = ref('')
const base64 = ref('')
const mime = ref('')
const loading = ref(false)
const msg = ref('')

// Function URL
const FN_URL = 'https://us-central1-fit5032-ass1.cloudfunctions.net/sendEmailWithAttachment'

function onPick(e) {
  const f = e.target.files?.[0]
  if (!f) return
  fileName.value = f.name
  mime.value = f.type || 'application/octet-stream'
  const reader = new FileReader()
  reader.onload = () => {
    const raw = reader.result.split(',')[1]
    base64.value = raw
  }
  reader.readAsDataURL(f)
}

async function send() {
  msg.value = ''; loading.value = true
  try {
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        to: to.value, subject: 'NFP Nutrition – Test',
        text: text.value, filename: fileName.value, base64: base64.value, mime: mime.value
      })
    })
    msg.value = res.ok ? '✅ Sent!' : '❌ ' + (await res.text())
  } catch (e) { msg.value = '❌ ' + e.message }
  finally { loading.value = false }
}
</script>
