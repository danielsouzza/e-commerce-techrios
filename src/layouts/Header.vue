<script setup>
import {Icon} from "@iconify/vue";
import AppLogo from "../components/ui-components/AppLogo.vue";
</script>

<template>

  <v-app-bar :elevation="0">
    <template v-slot:prepend>
      <v-btn icon ><Icon icon="fluent:line-horizontal-3-16-filled" width="25"/></v-btn>
    </template>
    <div><AppLogo/></div>
    <template v-slot:append>
      <v-btn icon ><Icon icon="mdi:user-circle-outline" width="25"/></v-btn>
    </template>
  </v-app-bar>
</template>
