<script setup>

</script>

<template>
  <div class="not-found tw-h-[25em] tw-flex tw-flex-col tw-justify-center tw-items-center">
    <h1>Página Não Encontrada</h1>
    <p>A página que você está procurando não existe.</p>
    <router-link to="/">Voltar para a página inicial</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}

h1 {
  font-size: 2rem;
  color: #ff5252;
}

p {
  font-size: 1.2rem;
}

a {
  text-decoration: none;
  color: #42b983;
  font-weight: bold;
}
</style>