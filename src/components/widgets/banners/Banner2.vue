<script setup>

defineProps({
  src: String,
  link: String,
})

</script>

<template>
  <v-img :src="src" class="tw-rounded-md tw-h-[100px] md:tw-h-[115px] lg:tw-h-[200px]" :href="link"/>
</template>

<style scoped>

</style>