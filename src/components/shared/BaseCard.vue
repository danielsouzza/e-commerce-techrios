<script setup>

const props = defineProps({
  title: String,
  active: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "success",

  },
})

</script>

<template>
  <v-container class=" !tw-p-0">
    <v-card flat  rounded="lg"  >
      <div v-if="title" class="tw-text-xs tw-font-extrabold tw-bg-green-400 !tw-text-white tw-px-4 tw-py-2 pb-5 tw-uppercase" >{{title}}</div>
      <v-card :variant="active ? 'outlined': 'flat' " :class="[[active ? '!tw-border-2': '' ],[title ? '-tw-top-4' : '']]" elevation="0" class=" !tw-bg-white !tw-border-green-400 pa-3" rounded="lg"  >
        <slot></slot>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>