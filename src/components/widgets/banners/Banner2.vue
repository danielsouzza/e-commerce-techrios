<script setup>

defineProps({
  src: String,
  link: String,
})

</script>

<template>
  <img :src="src" class="tw-rounded-md tw-h-[100px] md:tw-h-[115px] lg:tw-h-[200px]"  alt=""/>
</template>

<style scoped>

</style>