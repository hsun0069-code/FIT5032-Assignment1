import { defineStore } from 'pinia'
const RES_KEY = 'nfp_resources'
const RATINGS_KEY = 'nfp_ratings' // { [resourceId]: { [email]: number } }
const sanitize = (s) => String(s).replace(/[<>\"'`]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[m]))

const defaultResources = [
    { id: 'r1', title: 'Healthy Plate Basics', summary: 'Visual guide to balanced meals', tags: ['guide', 'beginner'] },
    { id: 'r2', title: 'Budget-Friendly Recipes', summary: 'Nutritious meals under $5/serve', tags: ['recipes'] },
]

export const useResourcesStore = defineStore('resources', {
    state: () => ({
        items: JSON.parse(localStorage.getItem(RES_KEY) || 'null') || defaultResources,
        ratings: JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}'),
    }),
    getters: {
        getById: (s) => (id) => s.items.find(i => i.id === id),
        avgRating: (s) => (id) => {
            const r = s.ratings[id] || {}; const vals = Object.values(r)
            return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0
        }
    },
    actions: {
        addResource({ title, summary, tags }) {
            title = sanitize(title); summary = sanitize(summary)
            const id = 'r' + Date.now().toString(36)
            this.items.push({ id, title, summary, tags })
            localStorage.setItem(RES_KEY, JSON.stringify(this.items))
        },
        rate({ resourceId, email, value }) {
            if (value < 1 || value > 5) return
            const r = this.ratings[resourceId] || {}
            r[email] = value; this.ratings[resourceId] = r
            localStorage.setItem(RATINGS_KEY, JSON.stringify(this.ratings))
        }
    }
})
