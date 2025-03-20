<script setup>
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import {onMounted, ref} from "vue";
import {emitter, SHOW_NOTIFICATION} from "../event-bus.js";
import DialogNotification from "../components/shared/DialogNotification.vue";
import {useLoadingStore} from "../store/states.js";

const show = ref(false)
const type = ref('success')
const message = ref('')



onMounted(() => {
  emitter.on(SHOW_NOTIFICATION, ({type: t, message: msg}) => {
    show.value = true;
    type.value = t;
    message.value = msg;

  })
})

</script>

<template>
  <div class="lp-wraper tw-bg-gray-50">
    <Header class="mb-auto border-t-lg  !tw-border-secondary" />
    <slot/>
    <Footer class="mt-auto"/>
    <v-overlay
        :model-value="useLoadingStore().isLoading"
        persistent
        opacity="50%"
        class="align-center justify-center"
    >
      <v-progress-circular
          width="2"
          color="white"
          size="90"
          indeterminate
      ></v-progress-circular>
    </v-overlay>
    <DialogNotification
        v-model="show"
        :message="message"
        :type="type"
        :timeout="5000"
    >
    </DialogNotification>
  </div>

</template>

<style scoped>
.v-app-bar.v-toolbar{
  top:0 !important;
  border-radius: 0 !important;
  max-width: 100% !important;
}
</style>