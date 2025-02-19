<script setup>

import {computed, inject} from "vue";

const themeConfig = inject('themeConfig');


defineProps({
  footer: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "120"
  }
})

const logo = computed(()=>{
  return themeConfig.logo+`?t=${Date.now()}`
})

</script>

<template>
    <img v-if="footer" src="/assets/images/logo-yjara-white.svg" :width="size" alt=""/>
    <v-avatar v-else  :size="size" >
      <img  :src="logo"  alt="" />
    </v-avatar>

</template>

<style>

</style>