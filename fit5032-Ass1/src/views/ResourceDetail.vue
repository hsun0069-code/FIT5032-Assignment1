<template>
  <div class="container py-4" v-if="item">
    <h1 class="h3">{{ item.title }}</h1>
    <p class="lead">{{ item.summary }}</p>
    <div class="my-3">
      <RatingStars :value="myRating" :avg="avg" @rate="rate" />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResourcesStore } from '@/stores/resources'
import { useAuthStore } from '@/stores/auth'
import RatingStars from '@/components/RatingStars.vue'
const route = useRoute(), res = useResourcesStore(), auth = useAuthStore()
const item = computed(()=> res.getById(route.params.id))
const avg = computed(()=> res.avgRating(route.params.id))
const myRating = computed(()=> (res.ratings[route.params.id]?.[auth.user?.email] ?? 0))
const rate = (n)=> {
  if (!auth.isAuthenticated) return alert('Please login to rate')
  res.rate({ resourceId: route.params.id, email: auth.user.email, value: n })
}
</script>
