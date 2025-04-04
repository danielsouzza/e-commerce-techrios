<script setup>
import { ref, watch, computed } from 'vue';
import { VIcon } from 'vuetify/components';
import {Icon} from "@iconify/vue";

const props = defineProps({
  modelValue: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success',
  },
  timeout: {
    type: Number,
    default: 4000,
  }
});

const emit = defineEmits(['update:modelValue']);

const show = ref(props.modelValue);
const progress = ref(100);
let interval = null;

const colors = computed(() => {
  switch(props.type) {
    case 'success':
      return { bg: 'green', icon: 'icon-park-solid:success' };
    case 'info':
      return { bg: 'blue', icon: 'gg:info' };
    default:
      return { bg: 'red', icon: 'mi:circle-error' };
  }
});


const startProgress = () => {
  progress.value = 100;
  clearInterval(interval);
  interval = setInterval(() => {
    progress.value -= (100 / (props.timeout / 100));
    if (progress.value <= 0) {
      clearInterval(interval);
      emit('update:modelValue', false);
    }
  }, 100);
};

watch(() => props.modelValue, (newVal) => {
  show.value = newVal;
  if (newVal) startProgress();
});

const closeNotification = () => {
  clearInterval(interval);
  emit('update:modelValue', false);
};
</script>

<template>
  <v-overlay  v-model="show"  @click="closeNotification" class="!tw-justify-center !tw-top-[10%]" >
    <transition name="slide-fade">
      <div
          v-if="show"
          class="notification-container  "
          :class="`bg-${colors.bg}`"
      >
        <div class="tw-w-full tw-flex tw-flex-col tw-items-center tw-pb-3 tw-text-center">
          <v-icon class="close-btn" icon="mdi-close" @click="emit('update:modelValue', false)"></v-icon>
          <Icon :icon="colors.icon" width="30" class="icon"  />
<!--          <v-icon class="icon" :icon="colors.icon"></v-icon>-->
          <span class="message mt-2">{{ message }}</span>
        </div>

        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
    </transition>
  </v-overlay>

</template>

<style scoped>
.notification-container {
  position: relative;
  min-height: 80px;
  min-width: 350px;
  max-width: 500px;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  color: white;
  font-weight: 500;
  z-index: 9999;
}

.icon {
  font-size: 22px;
}

.close-btn {
  font-size: 20px;
  cursor: pointer;
  margin-left: auto;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 8px;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: width 0.1s linear;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
