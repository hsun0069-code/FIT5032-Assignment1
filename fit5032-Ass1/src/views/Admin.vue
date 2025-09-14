<template>
  <div class="container py-4">
    <h1 class="h3">Admin</h1>
    <form class="row g-2" @submit.prevent="add">
      <div class="col-12 col-md-4"><input v-model.trim="title" class="form-control" placeholder="Title" required /></div>
      <div class="col-12 col-md-6"><input v-model.trim="summary" class="form-control" placeholder="Summary" required /></div>
      <div class="col-12 col-md-2"><button class="btn btn-primary w-100">Add</button></div>
    </form>
    <ul class="list-group mt-3">
      <li v-for="r in res.items" :key="r.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div><strong>{{ r.title }}</strong> <span class="text-muted">— {{ r.summary }}</span></div>
        <span class="badge bg-secondary">Avg {{ res.avgRating(r.id) }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useResourcesStore } from '@/stores/resources'
const res = useResourcesStore()
const title = ref(''), summary = ref('')
const add = ()=> {
  if (!title.value || !summary.value) return
  res.addResource({ title: title.value, summary: summary.value, tags: [] })
  title.value = summary.value = ''
}
</script>

