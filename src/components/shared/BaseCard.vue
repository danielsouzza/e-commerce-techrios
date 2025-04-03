<script setup>

import {computed} from "vue";

const props = defineProps({
  title: String,
  active: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "green-400",

  },
})

const classes = computed(()=>{
  return [
    props.active ? '!tw-border-2' : '',
    props.title ? '-tw-top-4' : '',
  ]
})

</script>

<template>
  <v-container class=" !tw-p-0 !tw-mx-0 !tw-bg-white" rounded="lg">
    <v-card  :variant="'outlined' "  rounded="lg"  class="!tw-border-gray-200 pb-2">
      <div v-if="title" :class="'!tw-bg-'+color" class="tw-text-xs tw-font-extrabold  !tw-text-white tw-px-4 tw-py-2  pb-5 tw-uppercase " >{{title}}</div>
      <v-card
          :class="classes"
         flat
          elevation="0"
          class=" !tw-bg-white px-3 pt-3 !tw-h-full "
          rounded="lg"  >
        <slot></slot>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>