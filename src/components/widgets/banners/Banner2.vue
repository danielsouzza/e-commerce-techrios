<script setup>

defineProps({
  src: String,
  link: String,
})

</script>

<template>
  <a :href="link" target="_blank">
     <img :src="src"  class="tw-rounded-md tw-h-[100px] md:tw-h-[115px] lg:tw-h-[200px]"  alt=""/>
  </a>
</template>

<style scoped>

</style>