<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { routes } from '../../../services/fetch.js'

const loading = ref(true)
const slides = ref([])
const currentSlide = ref(0)
const imagesLoadedCount = ref(0)
const imagesReady = ref(false)
const intervalId = ref(null)

// Intersection Observer para lazy loading
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  },
  { rootMargin: '50px' }
)

async function getSlides() {
  const subdomain = window?.subdomain || 'defaultSubdomain'

  try {
    const res = await routes['banners']({ subdomain, principal: 1 })
    slides.value = res.data.data
    
    // Pré-carregamento da primeira imagem de forma segura
    if (slides.value.length > 0) {
      const img = new Image()
      img.onload = imageLoaded
      img.src = slides.value[0].image_url
    }
  } catch (error) {
    console.error('Erro ao carregar banners:', error)
    slides.value = []
  } finally {
    loading.value = false
  }
}

function imageLoaded() {
  imagesLoadedCount.value++
  if (imagesLoadedCount.value >= slides.value.length) {
    imagesReady.value = true
  }
}

function startSlideshow() {
  if (intervalId.value) return
  
  intervalId.value = setInterval(() => {
    if (slides.value.length > 0) {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length
    }
  }, 10000)
}

function stopSlideshow() {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

onMounted(() => {
  getSlides()
  startSlideshow()
  
  // Pausar slideshow quando a aba estiver inativa
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSlideshow()
    } else {
      startSlideshow()
    }
  })
})

onUnmounted(() => {
  stopSlideshow()
  document.removeEventListener('visibilitychange', () => {})
})
</script>

<template>
  <div class="tw-relative tw-w-full tw-overflow-hidden tw-h-[170px] lg:tw-h-[500px]">
    <!-- Placeholder otimizado -->
    <div
      v-if="loading || !imagesReady"
      class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-gray-200"
      role="progressbar"
      aria-busy="true"
    >
      <v-progress-circular
        width="2"
        color="white"
        size="90"
        indeterminate
      />
    </div>

    <!-- Slides com otimização de performance -->
    <div
      v-if="slides.length > 0"
      class="tw-relative tw-h-full"
    >
      <div
        v-for="(item, index) in slides"
        :key="item.id || index"
        class="tw-absolute tw-inset-0 tw-transition-opacity tw-duration-1000"
        :class="{ 'tw-opacity-0': currentSlide !== index, 'tw-opacity-100': currentSlide === index }"
        :aria-hidden="currentSlide !== index"
      >
        <a
          v-if="item.redirect_url"
          :href="item.redirect_url"
          :target="item.target"
          class="tw-block tw-w-full tw-h-full"
          rel="noopener"
        >
          <img
            :src="item.image_url"
            :alt="item.title || 'Banner'"
            class="tw-object-cover tw-w-full tw-h-full"
            @load="imageLoaded"
            width="1335"
            height="500"
          />
        </a>
        <img
          v-else
          :src="item.image_url"
          :alt="item.title || 'Banner'"
          class="tw-object-cover tw-w-full tw-h-full"
          @load="imageLoaded"
          width="1335"
          height="500"
        />
      </div>
    </div>
    
    <!-- Indicadores de navegação -->
    <div 
      v-if="slides.length > 1" 
      class="tw-absolute tw-bottom-4 tw-left-1/2 tw-transform tw--translate-x-1/2 tw-flex tw-gap-2"
    >
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-white tw-opacity-50 hover:tw-opacity-100 focus:tw-opacity-100"
        :class="{ '!tw-opacity-100': currentSlide === index }"
        @click="currentSlide = index"
        :aria-label="'Ir para slide ' + (index + 1)"
        :aria-current="currentSlide === index"
      />
    </div>
  </div>
</template>

<style scoped>
.v-progress-circular {
  transition: opacity 0.3s ease;
}

img {
  will-change: opacity;
  transform: translateZ(0);
}
</style>
