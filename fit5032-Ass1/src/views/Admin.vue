<template>
  <div class="container py-4">
    <h1 class="h3">Admin</h1>

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

    <!-- DataTable #1: Resource Table (with column search) -->
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

    <!-- DataTable #2: Sample user table (replace with your actual data source; D.3 requires two tables) -->
    <h2 class="h5 mb-3">Users – Interactive Table</h2>
    <div class="table-responsive">
      <table id="usersTable" class="display table table-striped w-100">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Registered</th>
          </tr>
        </tfoot>
        <tbody>
          <tr v-for="u in users" :key="u.email">
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

    <!-- Sending emails (connecting to cloud functions) -->
    <h2 class="h5 mb-3">Email (SendGrid via Cloud Function)</h2>
    <EmailTester />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useResourcesStore } from '@/stores/resources'
import EmailTester from '@/components/EmailTester.vue'

const res = useResourcesStore()
const title = ref(''), summary = ref('')

const add = () => {
  if (!title.value || !summary.value) return
  res.addResource({ title: title.value, summary: summary.value, tags: [] })
  title.value = summary.value = ''
}

// === DataTable #1 data: mapping table rows from resources ===
const resTableRows = computed(() =>
  res.items.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    avg: res.avgRating(r.id).toFixed(1),
  }))
)

// === DataTable #2 data: Sample users (replace with your actual data source/Firestore as needed)===
const users = ref([
  { name: 'Admin',  email: 'admin@staff.monash', role: 'admin',  provider: 'local',    registered: '2025-03-01' },
  { name: 'Alice',  email: 'alice@example.com',  role: 'member', provider: 'firebase', registered: '2025-03-05' },
  { name: 'Bob',    email: 'bob@example.com',    role: 'member', provider: 'local',    registered: '2025-03-09' },
])

// === Initializing DataTables ===
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

onMounted(async () => {
  await nextTick()

  // Table 1: Resource Table
  const $resTable = window.$ && window.$('#resTableAdmin')
  if ($resTable && $resTable.length) {
    const dt1 = $resTable.DataTable({ pageLength: 10 })
    enablePerColumnSearch($resTable, dt1)
  }

  // Table 2: User Table
  const $usersTable = window.$ && window.$('#usersTable')
  if ($usersTable && $usersTable.length) {
    const dt2 = $usersTable.DataTable({ pageLength: 10 })
    enablePerColumnSearch($usersTable, dt2)
  }
})
</script>
