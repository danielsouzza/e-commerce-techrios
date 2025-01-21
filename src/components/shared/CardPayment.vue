<script setup>

import {Icon} from "@iconify/vue";
import BaseCard from "./BaseCard.vue";
import {computed, ref} from "vue";

defineProps({
  modelValue:String,
  icon: String,
  title: String,
})

const open = ref(false)
const iconToggle = computed(()=> open.value ? 'mdi:chevron-up' : 'mdi:chevron-down')

function toggleOpen(){
  open.value = !open.value;
}

</script>

<template>

  <div class="tw-flex tw-flex-col tw-px-4 ">
    <div class=" tw-font-bold tw-text-gray-800 tw-flex tw-items-center tw-justify-between" @click="toggleOpen">
      <div class="tw-flex tw-items-center">
        <slot name="icon"></slot>
        {{title}}
      </div>
      <Icon :icon="iconToggle"  class="mr-2 " width="26"/>
    </div>
    <v-expand-transition>
      <div v-if="open" class="tw-flex tw-flex-col">
        <slot ></slot>
      </div>
    </v-expand-transition>

  </div>

</template>

<style scoped>

</style>