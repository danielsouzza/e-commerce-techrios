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
  const borderColor =  '!tw-border-' + props.color
  return [
    borderColor,
    props.active ? '!tw-border-2' : '',
    props.title ? '-tw-top-4' : '',
  ]
})

</script>

<template>
  <v-container class=" !tw-p-0 !tw-mx-0">
    <v-card flat  rounded="lg"  >
      <div v-if="title" :class="'!tw-bg-'+color" class="tw-text-xs tw-font-extrabold  !tw-text-white tw-px-4 tw-py-2 pb-5 tw-uppercase" >{{title}}</div>

      <v-card
          :class="classes"
          :variant="active ? 'outlined': 'flat' "
          elevation="0"
          class=" !tw-bg-white pa-3"
          rounded="lg"  >
        <slot></slot>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>