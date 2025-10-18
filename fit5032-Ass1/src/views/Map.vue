<template>
  <div class="container py-3">
    <div class="input-group mb-3">
      <input
        v-model="query"
        type="text"
        class="form-control"
        placeholder="Search city, e.g., Melbourne"
        @keyup.enter="goSearch"
      />
      <button class="btn btn-primary" @click="goSearch">Search</button>
    </div>

    <!-- Fixed height map container -->
    <div ref="mapEl" class="leaflet-map"></div>

    <div class="card bg-light mt-3">
      <div class="card-body">
        <h5 class="card-title mb-2">Weather in {{ city }}</h5>
        <ul class="mb-0">
          <li>Temp: {{ weather.temp }}°C</li>
          <li>Humidity: {{ weather.humidity }}%</li>
          <li>Condition: {{ weather.desc }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'   

const mapEl = ref(null)
const map = ref(null)
const marker = ref(null)

const city = ref('Melbourne')
const query = ref('Melbourne')
const weather = ref({ temp: '-', humidity: '-', desc: '-' })

// Free geocoding with Nominatim
async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' }})
  const data = await res.json()
  if (!data.length) throw new Error('Location not found')
  return { lat: +data[0].lat, lon: +data[0].lon }
}

async function fetchWeatherByCoords(lat, lon) {
  const API = 'aba72e19a3491abb44956c46f04188dc' // key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API}`
  const res = await fetch(url)
  const data = await res.json()
  weather.value = {
    temp: data.main?.temp ?? '-',
    humidity: data.main?.humidity ?? '-',
    desc: data.weather?.[0]?.description ?? '-',
  }
}

const goSearch = async () => {
  try {
    const { lat, lon } = await geocode(query.value.trim() || 'Melbourne')
    city.value = query.value.trim() || 'Melbourne'

    if (!map.value) return
    map.value.setView([lat, lon], 12)
    if (!marker.value) {
      marker.value = L.marker([lat, lon]).addTo(map.value)
    } else {
      marker.value.setLatLng([lat, lon])
    }
    await fetchWeatherByCoords(lat, lon)

    setTimeout(() => map.value && map.value.invalidateSize(), 50)
  } catch (e) {
    alert(e.message || 'Search failed')
  }
}

onMounted(async () => {
  await nextTick()
  // Initialize the map
  map.value = L.map(mapEl.value, { zoomControl: true }).setView([-37.8136, 144.9631], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)

  // Initial marker
  marker.value = L.marker([-37.8136, 144.9631]).addTo(map.value)

  setTimeout(() => map.value.invalidateSize(), 100)

  // First weather
  await fetchWeatherByCoords(-37.8136, 144.9631)
})
</script>

<style scoped>
/* Fixed map container height and width */
.leaflet-map {
  height: 60vh;     
  min-height: 360px;
  width: 100%;
  border-radius: .5rem;
  overflow: hidden;
}

.leaflet-container {
  font: inherit;
}
</style>
