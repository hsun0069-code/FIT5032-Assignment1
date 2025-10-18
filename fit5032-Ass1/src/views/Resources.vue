<template>
  <div class="container py-4">
    <h1 class="h3">Resources</h1>

    
    <div class="row g-3">
      <div v-for="r in res.items" :key="r.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ r.title }}</h5>
            <p class="card-text">{{ r.summary }}</p>
            <RouterLink class="btn btn-outline-primary" :to="{ name:'ResourceDetail', params:{ id:r.id } }">View</RouterLink>
          </div>
          <div class="card-footer">
            <RatingStars :avg="res.avgRating(r.id)" />
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4" />

    
    <h2 class="h5 mb-3">Resources – Interactive Table</h2>
    <div class="table-responsive">
      <table id="resTable" class="display table table-striped w-100">
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
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.title }}</td>
            <td>{{ row.summary }}</td>
            <td>{{ row.avg }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { useResourcesStore } from '@/stores/resources'
import RatingStars from '@/components/RatingStars.vue'

const res = useResourcesStore()

const rows = computed(() =>
  res.items.map(r => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    avg: res.avgRating(r.id).toFixed(1),
  }))
)

// 列搜索（jQuery 版）
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
  const $table = window.$ && window.$('#resTable')
  if ($table && $table.length) {
    const dt = $table.DataTable({ pageLength: 10 })
    enablePerColumnSearch($table, dt)
  }
})
</script>
