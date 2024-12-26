<script setup>
import {Icon} from "@iconify/vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
</script>

<template>
  <v-card class="mx-3 !tw-rounded-xl "  elevation="0"  >
    <v-card-title class="tw-text-wrap !tw-whitespace-normal px-5 ">Cadastre seu e-mail e telefone para receber ofertas e descontos</v-card-title>
    <v-card-item>
      <v-text-field class="my-class px-2" hide-details="auto" flat variant="solo" placeholder="DIGITE SEU E-MAIL"></v-text-field>
      <v-text-field class="my-class px-2" hide-details="auto" flat variant="solo" placeholder="DIGITE SEU WHATSAPP"></v-text-field>
    </v-card-item>
    <v-btn class="tw-w-full  !tw-h-auto " variant="flat" color="secondary" rounded="0" >
      <div class="tw-text-[20px] py-3 tw-flex tw-items-center tw-text-white tw-font-[900]  tw-normal-case ">
        <Icon icon="line-md:email" class="tw-text-[30px] tw-text-black tw-mr-1 " />Cadastrar
      </div>
    </v-btn>

  </v-card>
</template>

<style scoped>

.my-class::v-deep(.v-field__input) {
  min-height: 42px !important;
  padding-top: 0!important;
  padding-bottom: 0!important;
  padding-inline: 0!important;
}

.my-class::v-deep(.v-field--appended){
  padding-inline-end: 0 !important;
}

.my-class::v-deep( .v-field--prepended) {
  padding-inline-start: 0 !important;
}
</style>