<script setup>
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import {onMounted, ref} from "vue";
import {emitter, SHOW_NOTIFICATION} from "../event-bus.js";

const show = ref(false)
const type = ref('success')
const message = ref('')

function close() {
  show.value = false;
  type.value = '';
  message.value = ''
}

onMounted(() => {
  let timeout;
  emitter.on(SHOW_NOTIFICATION, ({type: t, message: msg}) => {
    show.value = true;
    type.value = t;
    message.value = msg;

    // if (timeout) clearTimeout(timeout)
    // timeout = setTimeout(() => {
    //   close()
    // }, 5000)
  })
})

</script>

<template>
  <div class="lp-wraper tw-bg-gray-50">
    <Header class="mb-auto border-t-lg  !tw-border-secondary" />
    <slot/>
    <Footer class="mt-auto"/>
    <v-snackbar
        z-index="2410"
        :timeout="4000"
        :color="type === 'success' ? 'green' : 'red'"
        v-model="show"
        @update:modelValue="close"
        multi-line
    >
            <span class="tw-text-white tw-text-xl">
                {{message}}
            </span>
    </v-snackbar>
  </div>

</template>

<style scoped>
.v-app-bar.v-toolbar{
  top:0 !important;
  border-radius: 0 !important;
  max-width: 100% !important;
}
</style>