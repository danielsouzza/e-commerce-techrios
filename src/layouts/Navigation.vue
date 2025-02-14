<script setup>
</script>

<template>
  <RouterLink  :to="{name: 'rios-de-ofertas'}">
    <v-btn class="hidden-sm-and-down" :ripple="false" rounded="sm" variant="text">
      <span class="tw-text-p">SUPER OFERTAS</span>
    </v-btn>
  </RouterLink>

  <v-btn class="hidden-sm-and-down " :ripple="false" rounded="sm" variant="text" color="primary">
    <span class="tw-text-p">MAIS PROCURADOS</span>

  </v-btn>

</template>
