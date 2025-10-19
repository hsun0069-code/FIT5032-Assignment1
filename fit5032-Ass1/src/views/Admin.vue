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
        <button class="btn btn-outline-secondary btn-sm" @click="selectAll">Select all</button>
        <button class="btn btn-outline-secondary btn-sm" @click="clearAll">Clear</button>
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
        <button class="btn btn-primary" @click="sendBulk" :disabled="sending">
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
      <li>
        <code>{{ owmUrl }}</code>
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="testOwm">Test</button>
      </li>
      <li class="mt-1">
        <code>{{ aiUrl }}</code>
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="testAi">Test</button>
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

/* -- New: Dashboard Statistics -- */
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const memberCount = computed(() => users.value.filter(u => u.role !== 'admin').length)

const roleChart = ref(null)
const ratingChart = ref(null)

/* -- New resources -- */
const add = () => {
  if (!title.value || !summary.value) return
  res.addResource({ title: title.value, summary: summary.value, tags: [] })
  title.value = summary.value = ''
  //Refresh the chart after data is updated
  drawCharts()
}

/* -- DataTables  -- */
const resTableRows = computed(() =>
  res.items.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    avg: res.avgRating(r.id).toFixed(1),
  }))
)

/* -- DataTable Initialization -- */
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
const bulk = ref({ subject: '', text: '' })
const sending = ref(false)
const msg = ref('')
const attach = ref(null)           // { filename, base64, mime }

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
const aiUrl  = ref(`${functionsBase}/aiSuggest?prompt=Write%20a%20short%20welcome%20email%20subject`)

/* Mass Send */
async function sendBulk() {
  if (!selectedEmails.value.length) { msg.value = 'Please select at least one user.'; return }
  if (!bulk.value.subject || !bulk.value.text) { msg.value = 'Subject and body are required.'; return }
  sending.value = true; msg.value = 'Sending...'
  try {
    const payloadBase = {
      subject: bulk.value.subject,
      text: bulk.value.text,
    }
    if (attach.value) Object.assign(payloadBase, attach.value)

    // Send sequentially; can also Promise.all concurrently
    for (const to of selectedEmails.value) {
      const payload = { to, ...payloadBase }
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

/* --AI generates email copy (calling aiSuggest) -- */
async function aiFill(){
  try {
    const subjectRes = await fetch(`${functionsBase}/aiSuggest?prompt=${encodeURIComponent('Create a catchy email subject for announcing our new healthy-eating resources, under 10 words.')}`)
    const subj = await subjectRes.text()
    const bodyRes = await fetch(`${functionsBase}/aiSuggest?prompt=${encodeURIComponent('Write a short friendly email (80-120 words) inviting users to check our new healthy-eating resources. No markdown.')}`)
    const body = await bodyRes.text()
    bulk.value.subject = subj.replace(/^"|"$/g,'')
    bulk.value.text = body
    msg.value = 'AI has suggested a subject & body. Review before sending.'
  } catch (e) {
    msg.value = 'AI suggestion failed: ' + e.message
  }
}

/* -- Public API test button -- */
async function testOwm(){
  const r = await fetch(owmUrl.value)
  const txt = await r.text()
  alert(txt.slice(0, 250) + (txt.length > 250 ? '...' : ''))
}
async function testAi(){
  const r = await fetch(aiUrl.value)
  const txt = await r.text()
  alert(txt)
}

/* -- Charts -- */
let roleChartInstance = null
let ratingChartInstance = null

function drawCharts(){
  // 1) User role pie chart
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
  // 2) Average distribution bar chart of each resource
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

  // DataTable: Resources
  const $resTable = window.$ && window.$('#resTableAdmin')
  if ($resTable && $resTable.length) {
    const dt1 = $resTable.DataTable({ pageLength: 10 })
    enablePerColumnSearch($resTable, dt1)
  }
  // DataTable: Users
  const $usersTable = window.$ && window.$('#usersTable')
  if ($usersTable && $usersTable.length) {
    const dt2 = $usersTable.DataTable({ pageLength: 10 })
    enablePerColumnSearch($usersTable, dt2)
  }

  // Initial drawing of the chart
  drawCharts()
})
</script>
