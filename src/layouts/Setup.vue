<script setup>
import { defineAsyncComponent, onMounted, onUnmounted, ref } from "vue"
import {emitter, SCROLL_BEHAVIOR, SHOW_NOTIFICATION} from "../event-bus.js"
import {useLoadingStore} from "../store/states.js"

// Componentes carregados assincronamente
const Footer = defineAsyncComponent(() => import("./Footer.vue"))
const Header = defineAsyncComponent(() => import("./Header.vue"))
const DialogNotification = defineAsyncComponent(() =>
  import("../components/shared/DialogNotification.vue")
)

const show = ref(false)
const type = ref('success')
const message = ref('')

// Debounce para scroll
let scrollTimeout

function scrollBehavior() {
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout)
  }

  scrollTimeout = window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
}

// Event handlers
function handleNotification({type: t, message: msg}) {
  show.value = true
  type.value = t
  message.value = msg
}

function handleScroll() {
  scrollBehavior()
}

onMounted(() => {
  emitter.on(SHOW_NOTIFICATION, handleNotification)
  emitter.on(SCROLL_BEHAVIOR, handleScroll)

  // Otimização de performance
  if ('connection' in navigator) {
    if (navigator.connection.saveData) {
      // Modo de economia de dados ativo
      document.body.classList.add('save-data')
    }
  }
})

onUnmounted(() => {
  emitter.off(SHOW_NOTIFICATION, handleNotification)
  emitter.off(SCROLL_BEHAVIOR, handleScroll)
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout)
  }
})
</script>

<template>
  <div class="lp-wraper tw-bg-gray-50">
    <Header class="mb-auto border-t-lg !tw-border-secondary" />
    <slot/>
    <Footer class="mt-auto"/>

    <!-- Loading overlay com transição suave -->
    <Transition name="fade">
      <v-overlay
        :model-value="useLoadingStore().isLoading"
        persistent
        class="align-center justify-center"
      >
        <v-progress-circular
          width="2"
          color="white"
          size="90"
          indeterminate
        />
      </v-overlay>
    </Transition>

    <!-- Notification com transição -->
    <Transition name="slide">
      <DialogNotification

        v-model="show"
        :message="message"
        :type="type"
        :timeout="5000"
      />
    </Transition>
  </div>
</template>

<style scoped>
.v-app-bar.v-toolbar {
  top: 0 !important;
  border-radius: 0 !important;
  max-width: 100% !important;
  will-change: transform;
  transform: translateZ(0);
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Otimizações para modo de economia de dados */
.save-data img {
  image-rendering: auto;
}

/* Otimizações de performance */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>