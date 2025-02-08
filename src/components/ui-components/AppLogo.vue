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
    default: "130"
  }
})

const logo = computed(()=>{
  return themeConfig.logo || '../../assets/images/logo-techrios.svg'
})

</script>

<template>

    <img v-if="footer" src="../../assets/images/logo-techrios-black-white.svg" :width="size" alt=""/>
    <img v-else :src="logo" :width="size" alt=""/>
</template>

<style>

</style>