<template>
  <div class="d-flex gap-2">
    <button class="btn btn-outline-secondary btn-sm" @click="exportResources">
      Export Resources (CSV)
    </button>
    <button class="btn btn-outline-secondary btn-sm" @click="exportRatings">
      Export Ratings (CSV)
    </button>
  </div>
</template>

<script setup>
import { useResourcesStore } from '@/stores/resources'
import { downloadCSV } from '@/utils/csv'

const res = useResourcesStore()

// Export resource list
const exportResources = () => {
  const rows = res.items.map(r => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    tags: (r.tags || []).join('|'),
    avgRating: res.avgRating(r.id)
  }))
  downloadCSV('resources.csv', rows)
}

// Export rating details
const exportRatings = () => {
  const rows = []
  for (const id of res.items.map(i => i.id)) {
    const list = res.ratings[id] || []
    list.forEach((score, idx) => {
      rows.push({ resourceId: id, index: idx + 1, score })
    })
  }
  if (rows.length === 0) rows.push({ resourceId: '', index: '', score: '' })
  downloadCSV('ratings.csv', rows)
}
</script>
