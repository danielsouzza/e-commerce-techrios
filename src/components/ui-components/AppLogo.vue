<script setup>
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
</script>

<template>
    <img v-if="footer" src="../../assets/images/logo-techrios-black-white.svg" :width="size" alt=""/>
    <img v-else src="../../assets/images/logo-techrios.svg" :width="size" alt=""/>
</template>

<style>

</style>