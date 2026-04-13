import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createApp } from 'vue'

import App from './App.vue'
import './styles/main.css'

gsap.registerPlugin(ScrollTrigger)

createApp(App).mount('#app')