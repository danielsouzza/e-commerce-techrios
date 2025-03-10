<script setup>

import {reactive} from "vue";
import {getAppBaseUrl} from "../services/api.js";
import {routes} from "../services/fetch.js";
import {showErrorNotification, showSuccessNotification} from "../event-bus.js";
import router from "../routes/index.js";

const form = reactive({
  email: '',
  base_url:getAppBaseUrl()+'/registrar',
  errors:{},
  processing:false
})

const validateStepForm = () => {
  form.errors = {};
  const validateField = (field, errorMessage) => {
    if (!form[field]) {
      form.errors[field] = errorMessage;
    } else {
      delete form.errors[field];
    }
  };

  validateField('email', 'Por favor, insira seu email.');

  return Object.keys(form.errors).length === 0;
};

function handleSubmit() {
  if(validateStepForm()){
    form.processing = true
    routes['user.validate-email'](form).then((response) => {
      if (response.data.success) {
        showSuccessNotification(response.data.message);
      }
      form.processing = false
    }).catch(error => {
      form.processing = false
      showErrorNotification(error.response.data.data.error);
    })
  }
}

</script>

<template>
  <v-container>
    <v-card
        class="mx-auto pa-8 pb-8 my-4 tw-text-center"
        elevation="3"
        max-width="500"
        rounded="lg"
    >

      <div class="tw-flex tw-items-center  mb-5">
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
        <v-btn variant="outlined" color="secondary" rounded >
          <span class="tw-text-xs"> Confirma email</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
      </div>

      <v-form @submit.prevent="handleSubmit" validate-on="blur">
        <div class="text-body-2 mb-3">
          Para realizar o cadastro, informe seu email que deseja utilizar  no cadastro para validação. Iremos lhe enviar um email com o link para a tela de cadastro.
        </div>

        <v-text-field
            density="compact"
            color="secondary"
            v-model="form.email"
            :error-messages="form.errors.email"
            required
            placeholder="Digite o seu email "
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
        ></v-text-field>
      </v-form>

      <v-btn
          @click="handleSubmit"
          class="my-8"
          color="secondary"
          size="large"
          width="100%"
          rounded
          :loading="form.processing"
          :disabled="form.processing"
          text="Confirmar"
          type="submit"
          variant="outlined"
          block
      ></v-btn>

      <!--          <div class="text-caption">-->
      <!--            Não recebeu o link? <a class="text-decoration-underline" @click="handleSubmitResetPassword" href="#" @click.prevent="">Reenviar</a>-->
      <!--          </div>-->
      <div class="text-caption mt-2 tw-cursor-pointer">
        <a class="text-decoration-underline" @click="router.push({name: 'login'})" href="#" @click.prevent=""> Voltar ao login?</a>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>