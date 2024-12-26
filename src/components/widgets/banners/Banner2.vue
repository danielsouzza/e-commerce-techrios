<script setup>

defineProps({
  src: String,
  link: String,
})

</script>

<template>
  <v-img :src="src" class="tw-rounded-md" :href="link" :height="100"/>
</template>

<style scoped>

</style>