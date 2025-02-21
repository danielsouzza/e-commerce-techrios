<template>
  <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="auto"
  >
    <template #activator="{ props }">
      <v-text-field
          v-model="formattedDate"
          label="Data (dd/MM/yyyy)"
          readonly
          v-bind="props"
      />
    </template>
    <v-date-picker
        v-model="selectedDate"
        locale="pt"
        @input="updateDate"
    />
  </v-menu>
</template>

<script setup>
import { ref, computed } from 'vue';

const menu = ref(false);
const selectedDate = ref(null);

const formattedDate = computed({
  get: () => {
    if (!selectedDate.value) return '';
    const [year, month, day] = selectedDate.value.split('-');
    return `${day}/${month}/${year}`;
  },
  set: (value) => {
    const [day, month, year] = value.split('/');
    selectedDate.value = `${year}-${month}-${day}`;
  },
});

const updateDate = (date) => {
  selectedDate.value = date;
  menu.value = false;
};
</script>

<style>
/* Adicione estilos personalizados aqui, se necessário */
</style>
