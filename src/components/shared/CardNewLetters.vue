<script setup>
import {Icon} from "@iconify/vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
</script>

<template>
  <v-card class=" !tw-rounded-xl tw-w-full"  elevation="0"  >
    <div class="tw-flex tw-flex-col tw-h-full lg:tw-flex-row justify-space-between">
      <div class="tw-pl-5 tw-hidden lg:tw-block">
        <img :src="'./src/assets/images/footer/email.png'" alt=""  class="tw-w-[260px] tw-h-full"/>
      </div>
      <div class="tw-flex tw-flex-col tw-w-full tw-mx-0 lg:tw-mx-10 tw-p-2">
        <v-card-title class="tw-text-wrap !tw-whitespace-normal !tw-px-2 !tw-pb-0 ">Cadastre seu e-mail e telefone para receber ofertas e descontos</v-card-title>
        <v-row class="tw-w-full lg:tw-items-center ">
          <v-col cols="12" lg="6" md="6">
            <v-text-field :autofocus="false" class="my-class px-2 " hide-details="auto" flat variant="solo" placeholder="DIGITE SEU E-MAIL"></v-text-field>
          </v-col>
          <v-col  cols="12" lg="6" md="6">
            <v-text-field  :autofocus="false" class="my-class px-2 " hide-details="auto" flat variant="solo" placeholder="DIGITE SEU WHATSAPP"></v-text-field>
          </v-col>
        </v-row>

      </div>

      <v-btn class="tw-w-full lg:tw-w-[20%]  !tw-h-auto " variant="flat" color="secondary" rounded="0" >
        <div class="tw-text-[20px] py-3 tw-flex tw-items-center tw-text-white tw-font-[900]  tw-normal-case ">
          <Icon icon="line-md:email" class="tw-text-[30px] tw-text-black tw-mr-1 " />Cadastrar
        </div>
      </v-btn>
    </div>
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