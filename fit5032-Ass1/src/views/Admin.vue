<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="h3">Admin</h1>
      <ExportButtons />
    </div>

    <!-- Quick metrics -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="h1 mb-0">{{ users.length }}</div>
            <div class="text-muted">Total Users</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="h1 mb-0">{{ adminCount }}</div>
            <div class="text-muted">Admins</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="h1 mb-0">{{ memberCount }}</div>
            <div class="text-muted">Members</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="h1 mb-0">{{ res.items.length }}</div>
            <div class="text-muted">Resources</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard charts -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header fw-semibold">User Roles</div>
          <div class="card-body">
            <canvas ref="roleChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header fw-semibold">Avg Rating by Resource</div>
          <div class="card-body">
            <canvas ref="ratingChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Add resource -->
    <form class="row g-2" @submit.prevent="add">
      <div class="col-12 col-md-4">
        <input v-model.trim="title" class="form-control" placeholder="Title" required />
      </div>
      <div class="col-12 col-md-6">
        <input v-model.trim="summary" class="form-control" placeholder="Summary" required />
      </div>
      <div class="col-12 col-md-2">
        <button class="btn btn-primary w-100">Add</button>
      </div>
    </form>

    <ul class="list-group mt-3">
      <li
        v-for="r in res.items"
        :key="r.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ r.title }}</strong>
          <span class="text-muted">— {{ r.summary }}</span>
        </div>
        <span class="badge bg-secondary">Avg {{ res.avgRating(r.id) }}</span>
      </li>
    </ul>

    <hr class="my-4" />

    <!-- DataTable #1: Resource Table -->
    <h2 class="h5 mb-3">Resources – Interactive Table</h2>
    <div class="table-responsive">
      <table id="resTableAdmin" class="display table table-striped w-100">
        <thead>
          <tr>
            <th>Title</th>
            <th>Summary</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>Title</th>
            <th>Summary</th>
            <th>Avg Rating</th>
          </tr>
        </tfoot>
        <tbody>
          <tr v-for="row in resTableRows" :key="row.id">
            <td>{{ row.title }}</td>
            <td>{{ row.summary }}</td>
            <td>{{ row.avg }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="my-4" />

    <!-- Bulk Email + Users table (DataTable #2) -->
    <div class="d-flex align-items-center justify-content-between">
      <h2 class="h5 mb-3">Users – Interactive Table (Bulk Email)</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="selectAll" type="button">Select all</button>
        <button class="btn btn-outline-secondary btn-sm" @click="clearAll" type="button">Clear</button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-lg-4">
        <label class="form-label">Email Subject</label>
        <input v-model="bulk.subject" class="form-control" placeholder="Subject (e.g. Welcome to NFP)" />
      </div>
      <div class="col-12 col-lg-6">
        <label class="form-label">Email Body</label>
        <textarea v-model="bulk.text" rows="2" class="form-control" placeholder="Message text"></textarea>
      </div>
      <div class="col-12 col-lg-2">
        <label class="form-label">Attachment (optional)</label>
        <input type="file" class="form-control" @change="onFile" />
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" @click="sendBulk" type="button" :disabled="sending">
          {{ sending ? 'Sending...' : `Send to ${selectedEmails.length} users` }}
        </button>
        <button class="btn btn-outline-primary" @click="aiFill" type="button">AI Suggest Subject & Body</button>
      </div>
      <div v-if="msg" class="col-12">
        <div class="alert alert-info py-2 mb-0">{{ msg }}</div>
      </div>
    </div>

    <div class="table-responsive">
      <table id="usersTable" class="display table table-striped w-100">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Registered</th>
          </tr>
        </tfoot>
        <tbody>
          <tr v-for="u in users" :key="u.email">
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :value="u.email"
                v-model="selectedEmails"
                :aria-label="`select ${u.email}`"
              />
            </td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.provider }}</td>
            <td>{{ u.registered }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="my-4" />

    <!-- Public API demo & Email tester -->
    <h2 class="h5 mb-2">Public API Endpoints</h2>
    <p class="small text-muted mb-2">
      These are your exposed REST routes that reviewers can access directly for verification:
    </p>
    <ul class="list-unstyled small">
      <li class="d-flex align-items-center flex-wrap gap-2">
        <code class="me-2">{{ owmUrl }}</code>
        <button class="btn btn-sm btn-outline-secondary" @click="testOwm" type="button">Test</button>
        <button class="btn btn-sm btn-outline-secondary" @click="copy(owmUrl)" type="button" aria-label="Copy OWM URL">Copy</button>
      </li>
      <li class="d-flex align-items-center flex-wrap gap-2 mt-1">
        <code class="me-2">{{ aiUrl }}</code>
        <button class="btn btn-sm btn-outline-secondary" @click="testAi" type="button">Test</button>
        <button class="btn btn-sm btn-outline-secondary" @click="copy(aiUrl)" type="button" aria-label="Copy AI URL">Copy</button>
      </li>
    </ul>

    <h2 class="h5 mb-3">Email (SendGrid via Cloud Function)</h2>
    <EmailTester />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useResourcesStore } from '@/stores/resources'
import EmailTester from '@/components/EmailTester.vue'
import ExportButtons from '@/components/ExportButtons.vue'

/* -- data & stores -- */
const res = useResourcesStore()
const title = ref(''), summary = ref('')

const users = ref([
  { name: 'Admin',  email: 'admin@staff.monash', role: 'admin',  provider: 'local',    registered: '2025-03-01' },
  { name: 'Alice',  email: 'alice@example.com',  role: 'member', provider: 'firebase', registered: '2025-03-05' },
  { name: 'Bob',    email: 'bob@example.com',    role: 'member', provider: 'local',    registered: '2025-03-09' },
])

/* -- Dashboard Statistics -- */
const adminCount   = computed(() => users.value.filter(u => u.role === 'admin').length)
const memberCount  = computed(() => users.value.filter(u => u.role !== 'admin').length)

const roleChart = ref(null)
const ratingChart = ref(null)

/* -- Add resource -- */
const add = () => {
  if (!title.value || !summary.value) return
  res.addResource({ title: title.value, summary: summary.value, tags: [] })
  title.value = summary.value = ''
  drawCharts()
}

/* -- Data for table rows -- */
const resTableRows = computed(() =>
  res.items.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    avg: res.avgRating(r.id).toFixed(1),
  }))
)

/* -- DataTable helpers -- */
function enablePerColumnSearch($table, dt) {
  $table.find('tfoot th').each(function () {
    const title = this.textContent.trim()
    this.innerHTML = `<input type="text" placeholder="Search ${title}" class="form-control form-control-sm" />`
  })
  dt.columns().every(function () {
    const column = this
    const input = column.footer() && column.footer().querySelector('input')
    if (!input) return
    input.addEventListener('input', () => {
      column.search(input.value).draw()
    })
  })
}

/* -- Bulk Email -- */
const selectedEmails = ref([])
const bulk     = ref({ subject: '', text: '' })
const sending  = ref(false)
const msg      = ref('')
const attach   = ref(null) // { filename, base64, mime }

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) { attach.value = null; return }
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = String(reader.result).split(',')[1]
    attach.value = { filename: file.name, base64, mime: file.type || 'application/octet-stream' }
  }
  reader.readAsDataURL(file)
}

function selectAll(){ selectedEmails.value = users.value.map(u => u.email) }
function clearAll(){ selectedEmails.value = [] }

/* -- functions base -- */
const functionsBase = import.meta.env.VITE_FUNCTIONS_BASE || 'https://us-central1-fit5032-ass1.cloudfunctions.net'
const sendUrl = `${functionsBase}/sendEmailWithAttachment`
const owmUrl = ref(`${functionsBase}/owmForecast?city=Melbourne`)
const aiUrl  = ref(`${functionsBase}/aiSuggest?prompt=${encodeURIComponent('Write a short welcome email subject')}`)

/* Bulk send */
async function sendBulk() {
  if (!selectedEmails.value.length) { msg.value = 'Please select at least one user.'; return }
  if (!bulk.value.subject || !bulk.value.text) { msg.value = 'Subject and body are required.'; return }
  sending.value = true; msg.value = 'Sending...'
  try {
    const payloadBase = {
      subject: bulk.value.subject,
      text: bulk.value.text,
      ...(attach.value || {})
    }
    for (const to of selectedEmails.value) {
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, ...payloadBase })
      })
      if (!res.ok) throw new Error(`Failed to send to ${to}`)
    }
    msg.value = `Sent to ${selectedEmails.value.length} users successfully.`
  } catch (e) {
    msg.value = e.message
  } finally {
    sending.value = false
  }
}

/* ==AI POST == */
async function aiFill(){
  try {
    //1) Generate a topic (POST, JSON)
    const subjectRes = await fetch(`${functionsBase}/aiSuggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Create a catchy email subject for announcing our new healthy-eating resources, under 10 words.'
      })
    })
    const subjRaw = await subjectRes.text()
    let subjText = ''
    try { subjText = (JSON.parse(subjRaw).text || subjRaw) } catch { subjText = subjRaw }
    subjText = String(subjText).replace(/^"|"$/g,'')

    // 2) Generate body (POST, JSON)
    const bodyRes = await fetch(`${functionsBase}/aiSuggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Write a short friendly email (80-120 words) inviting users to check our new healthy-eating resources. No markdown.'
      })
    })
    const bodyRaw = await bodyRes.text()
    let bodyText = ''
    try { bodyText = (JSON.parse(bodyRaw).text || bodyRaw) } catch { bodyText = bodyRaw }

    bulk.value.subject = subjText
    bulk.value.text    = bodyText
    msg.value = 'AI has suggested a subject & body. Review before sending.'
  } catch (e) {
    msg.value = 'AI suggestion failed: ' + e.message
  }
}

/* -- Public API Test -- */
function openInNewTab(url) {
  const win = window.open(url, '_blank', 'noopener')
  return !!win
}
async function gracefulFetchAlert(url, label='Response') {
  try {
    const r = await fetch(url)
    const txt = await r.text()
    alert(`${label}:\n\n` + txt.slice(0, 800) + (txt.length > 800 ? '\n...\n(truncated)' : ''))
  } catch (e) {
    alert(`${label} failed: ${e.message}`)
  }
}
function testOwm(){
  if (!openInNewTab(owmUrl.value)) {
    gracefulFetchAlert(owmUrl.value, 'OWM Forecast')
  }
}
function testAi(){
  if (!openInNewTab(aiUrl.value)) {
    gracefulFetchAlert(aiUrl.value, 'AI Suggest')
  }
}
async function copy(valRef){
  try {
    await navigator.clipboard.writeText(valRef.value || valRef)
    alert('Copied!')
  } catch(_){}
}

/* -- Charts -- */
let roleChartInstance = null
let ratingChartInstance = null

function drawCharts(){
  const ctx1 = roleChart.value?.getContext('2d')
  if (ctx1){
    if (roleChartInstance) roleChartInstance.destroy()
    roleChartInstance = new window.Chart(ctx1, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Member'],
        datasets: [{ data: [adminCount.value, memberCount.value] }]
      }
    })
  }
  const labels = res.items.map(r => r.title)
  const data   = res.items.map(r => Number(res.avgRating(r.id).toFixed(1)))
  const ctx2 = ratingChart.value?.getContext('2d')
  if (ctx2){
    if (ratingChartInstance) ratingChartInstance.destroy()
    ratingChartInstance = new window.Chart(ctx2, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Avg Rating', data }]
      },
      options: { scales: { y: { beginAtZero: true, max: 5 } } }
    })
  }
}

/* -- lifecycle -- */
onMounted(async () => {
  await nextTick()

  if (window.$) {
    const $ = window.$
    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#resTableAdmin')) {
      const dt1 = $('#resTableAdmin').DataTable({ pageLength: 10 })
      enablePerColumnSearch($('#resTableAdmin'), dt1)
    }
    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#usersTable')) {
      const dt2 = $('#usersTable').DataTable({ pageLength: 10 })
      enablePerColumnSearch($('#usersTable'), dt2)
    }
  }

  drawCharts()
})
</script>
