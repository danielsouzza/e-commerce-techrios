<script setup>
function scrollToStartDiv(){
  const minhaDiv = document.getElementById("mais-buscados");
  minhaDiv.scrollIntoView({ behavior: "smooth", block: "start" });

}
</script>

<template>
  <RouterLink  :to="{name: 'super-ofertas'}">
    <v-btn class="hidden-sm-and-down" :ripple="false" rounded="sm" variant="text">
      <span class="tw-text-p">SUPER OFERTAS</span>
    </v-btn>
  </RouterLink>

  <v-btn @click="scrollToStartDiv" class="hidden-sm-and-down " :ripple="false" rounded="sm" variant="text" color="primary">
    <span class="tw-text-p">MAIS PROCURADOS</span>
  </v-btn>

</template>
