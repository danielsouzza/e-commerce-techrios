<script setup>

import {computed, ref} from "vue";
import {Icon} from "@iconify/vue";

defineProps({
  title: String,
})

const open = ref(false)
const iconToggle = computed(()=> open.value ? 'mdi:chevron-up' : 'mdi:chevron-down')

const boxHeight = ref("0px"); 
const boxOpacity = ref(0); 

const contentBox = ref(null);
const showContent = ref(false);
const toggleOpen = () => {
  const box = contentBox.value;
  if (!open.value) {
    showContent.value = true;
    requestAnimationFrame(() => {
      box.style.transition = "height 0.5s ease, opacity 0.3s ease";
      boxHeight.value =  box.scrollHeight + "px";
      boxOpacity.value = 1;
    });
  } else {
    requestAnimationFrame(() => {
      box.style.transition = "height 0.5s ease, opacity 0.3s ease";
      boxHeight.value = "0px";
      boxOpacity.value = 0;
      setTimeout(() => {
        showContent.value = false;
      }, 300);
    });
  }
  open.value = !open.value;
};
</script>

<template>

  <div class="tw-py-2">
    <div class="tw-cursor-pointer tw-flex tw-justify-between tw-items-center" @click="toggleOpen">
      <div class="tw-text-secondary tw-font-[700] tw-text-[15px] ">{{title}}</div>
      <Icon :icon="iconToggle" width="25"/>
    </div>
    <div
        ref="contentBox"
        :style="{ height: boxHeight, opacity: boxOpacity }"
         class="slide-toggle  tw-text-[14px] tw-font-[600]  overflow-hidden">
      <slot></slot>
    </div>
  </div>

</template>

<style scoped>
.slide-toggle {
  transition: height 0.5s ease, opacity 0.3s ease;
}
</style>