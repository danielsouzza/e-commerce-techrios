<script setup>
import {Icon} from "@iconify/vue";
import {routes} from "../../services/fetch.js";
import {reactive} from "vue";
import {validarEmail} from "../../Helper/Ultis.js";
import {showErrorNotification, showSuccessNotification} from "../../event-bus.js";

const form = reactive({
  email:'',
  telefone: '',
  processing:null,
  errors:{}
})

const validateForm = () => {
  form.errors = {};
  const validateField = (field, value, errorMessage) => {
    if (value === null || value === undefined || value === '') {
      form.errors[field] = errorMessage;
    } else {
      delete form.errors[field];
    }
  };

  const validatePhone = (field, value) => {
    const phone =  value.replace(/\D/g, '');
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!phone) {
      form.errors[field] = 'Por favor, insira um número de telefone.';
    } else if (!phoneRegex.test(phone)) {
      form.errors[field] = 'O telefone deve conter apenas números e ter 10 ou 11 dígitos.';
    } else {
      delete form.errors[field];
    }
  };


  validateField('email', form.email, 'Por favor, insira seu email.');
  validatePhone('telefone', form.telefone, 'Por favor, insira seu telefone.')

  if(form.email && !validarEmail(form.email)){
    form.errors.emial = 'Email invalido!'
  }
  return Object.keys(form.errors).length === 0;
};

function submit(){
  if(validateForm()){
    routes['newletters'](form).then((response) => {
      showSuccessNotification(response.data.message);
    }).catch((error) => {
      showErrorNotification(error.response.data.data.error)
    })
  }

}

</script>

<template>
  <v-card class=" !tw-rounded-xl tw-w-full"  elevation="0"  >
    <div class="tw-flex tw-flex-col tw-h-full lg:tw-flex-row justify-space-between">
      <div class="tw-pl-5 tw-hidden lg:tw-block">
        <img :src="'/assets/images/footer/email.png'" alt=""  class="tw-w-[260px] tw-h-full"/>
      </div>
      <div class="tw-flex tw-flex-col tw-w-full tw-mx-0 lg:tw-mx-10 tw-p-2">
        <v-card-title class="tw-text-wrap !tw-whitespace-normal !tw-px-2 !tw-pb-0 ">Cadastre seu e-mail e telefone para receber ofertas e descontos</v-card-title>
        <v-row class="tw-w-full lg:tw-items-center ">
          <v-col cols="12" lg="6" md="6">
            <v-text-field
                v-model="form.email"
                :error-messages="form.errors.email"
                :autofocus="false" class="my-class px-2 "
                hide-details="auto" flat variant="solo"
                placeholder="DIGITE SEU E-MAIL"></v-text-field>
          </v-col>
          <v-col  cols="12" lg="6" md="6">
            <v-text-field
                v-model="form.telefone"
                v-mask="'(##) #####-####'" :autofocus="false"
                class="my-class px-2 " hide-details="auto"
                :error-messages="form.errors.telefone"
                flat variant="solo" placeholder="DIGITE SEU WHATSAPP"></v-text-field>
          </v-col>
        </v-row>

      </div>

      <v-btn :loading="form.processing" :disabled="form.processing" @click="submit" class="tw-w-full lg:tw-w-[20%]  !tw-h-auto " variant="flat" color="secondary" rounded="0" >
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