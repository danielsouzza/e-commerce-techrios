<script setup>

import {Icon} from "@iconify/vue";
import {computed, ref, watch} from "vue";
import {emitter} from "../../event-bus.js";

const props = defineProps({
  modelValue:String,
  icon: String,
  title: String,
  value: String,
})

const emit = defineEmits(['update:modelValue'])

const open = ref(props.modelValue == props.value)
const iconToggle = computed(()=> open.value ? 'mdi:chevron-up' : 'mdi:chevron-down')

watch(()=>props.modelValue, (value)=> {
  open.value = props.modelValue == props.value
})

function toggleOpen(){
  emit("update:modelValue", props.modelValue == props.value? null : props.value );
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
