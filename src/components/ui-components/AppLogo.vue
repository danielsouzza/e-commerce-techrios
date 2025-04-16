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
<!--    <img v-if="footer" src="/assets/images/logo-yjara-white.svg" :width="size" alt=""/>-->
    <v-avatar   :size="size" >
      <img  :src="logo"  alt="" class="tw-invert tw-brightness-200 tw-contrast-150" />
    </v-avatar>

</template>

<style scoped>
/* Alternativa com CSS normal (se preferir essa abordagem) */
img {
  filter: brightness(0) invert(1);
}
</style>