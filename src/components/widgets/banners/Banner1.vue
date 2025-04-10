<script setup>
import { ref, onMounted } from 'vue'
import { routes } from '../../../services/fetch.js'

const loading = ref(true)
const slides = ref([])
const currentSlide = ref(0)
const imagesLoadedCount = ref(0)
const imagesReady = ref(false)

async function getSlides() {
  const subdomain = window?.subdomain || 'defaultSubdomain'

  routes['banners']({ subdomain, principal: 1 })
      .then((res) => {
        slides.value = res.data.data
      })
      .catch(() => {
        slides.value = []
      })
      .finally(() => {
        loading.value = false
      })
}

function imageLoaded() {
  imagesLoadedCount.value++
  if (imagesLoadedCount.value >= slides.value.length) {
    imagesReady.value = true
  }
}

setInterval(() => {
  if (slides.value.length > 0) {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
  }
}, 10000)

onMounted(() => {
  getSlides()
})
</script>

<template>
  <div class="tw-relative tw-w-full tw-overflow-hidden tw-h-[170px] lg:tw-h-[500px]">
    <!-- Placeholder -->
    <div
        v-if="loading || !imagesReady"
        class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-gray-200 "
    >
      <v-progress-circular
          width="2"
          color="white"
          size="90"
          indeterminate
      ></v-progress-circular>
    </div>

    <!-- Slides -->
    <div
        v-if="slides.length > 0"
        class="tw-relative tw-h-full tw-transition-opacity tw-duration-500"
        :class="{ 'tw-opacity-0': !imagesReady, 'tw-opacity-100': imagesReady }"
    >
      <div
          v-for="(item, index) in slides"
          :key="index"
          class="tw-absolute tw-inset-0 tw-transition-opacity tw-duration-1000 tw-ease-in-out"
          :class="{ 'tw-opacity-0': currentSlide !== index, 'tw-opacity-100': currentSlide === index }"
      >
        <a
            v-if="item.redirect_url"
            :href="item.redirect_url"
            :target="item.target"
            class="tw-block tw-w-full tw-h-full"
        >
          <img
              :src="item.image_url"
              alt="Banner"
              class="tw-object-cover tw-w-full tw-h-full"
              @load="imageLoaded"
          />
        </a>
        <img
            v-else
            :src="item.image_url"
            alt="Banner"
            class="tw-object-cover tw-w-full tw-h-full"
            @load="imageLoaded"
        />
      </div>
    </div>
  </div>
</template>
