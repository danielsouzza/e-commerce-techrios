<script setup>

import {ref} from "vue";
import {Icon} from "@iconify/vue";

const props = defineProps({
  textToCopy: String,
})

const coped = ref(false)


function copyToClipboard() {
  navigator.clipboard.writeText(props.textToCopy).then(() => {
    coped.value = true;
    setTimeout(() => {
      coped.value = false;
    },3000)
  });
}

</script>

<template>

  <v-text-field
      flat
      readonly
      variant="solo-filled"
      :value="textToCopy"
      hide-details="auto"
      @click:append-inner="copyToClipboard"
      class="!tw-w-[78%]  my-btn"
  >
    <template v-slot:append-inner>
      <v-tooltip :text="coped ? 'Copiado' : 'Copiar'">
        <template v-slot:activator="{ props }">
          <v-btn variant="elevated" v-bind="props" color="secondary" elevation="0"  @click="copyToClipboard" class="!tw-h-full !tw-w-full !tw-rounded-r-lg !tw-rounded-l-[0]" >
            <span class="!tw-text-white tw-flex tw-items-center tw-gap-2 !tw-font-semibold">
              {{coped ? 'Copiado' : 'Copiar'}}
            <Icon
                :icon="coped ? 'iconoir:clipboard-check' :'iconoir:paste-clipboard'"
                width="25"
                class="mr-2 tw-text-xl tw-cursor-pointer"
            /></span>
          </v-btn>

        </template>
      </v-tooltip>
    </template>

  </v-text-field>
</template>

<style scoped>
.my-btn::v-deep(.v-field--appended) {
  padding-inline-end: 0 !important;
}
</style>