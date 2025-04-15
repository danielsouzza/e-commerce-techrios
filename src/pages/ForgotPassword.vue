<script setup>
import { reactive } from "vue";
import { routes } from "../services/fetch.js";
import { getAppBaseUrl } from "../services/api.js";
import { showErrorNotification, showSuccessNotification } from "../event-bus.js";

const formReset = reactive({
  email: '',
  base_url: getAppBaseUrl(),
  errors: {},
  processing: false
});

function handleSubmitResetPassword() {
  if (!formReset.email) {
    formReset.errors['email'] = "Por favor, insira seu email.";
  } else {
    formReset.processing = true;
    routes['user.reset-password'](formReset).then((response) => {
      if (response.data.success) {
        showSuccessNotification(response.data.message);
      }
      formReset.processing = false;
    }).catch(error => {
      formReset.processing = false;
      showErrorNotification(error.response.data.data.error);
    });
  }
}
</script>

<template>
  <v-card color="primary" rounded="0" class="!tw-py-6">
    <div class="maxWidth tw-flex !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl tw-text-secondary">
        <strong class="tw-font-bold">Recuperação de Senha</strong>
      </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3">
    <v-card
      class="mx-auto pa-8 pb-8 my-4 tw-text-center"
      elevation="3"
      max-width="500"
      rounded="lg"
    >
      <div class="tw-flex tw-items-center mb-5">
        <v-divider :thickness="1" class="border-opacity-100"></v-divider>
        <v-btn variant="outlined" color="secondary" rounded>
          <span class="tw-text-xs">Esqueci minha senha</span>
        </v-btn>
        <v-divider :thickness="1" class="border-opacity-100"></v-divider>
      </div>

      <v-form @submit.prevent="handleSubmitResetPassword" validate-on="blur">
        <div class="text-body-2 mb-3">
          Para redefinir sua senha, informe o e-mail cadastrado na sua conta e lhe enviaremos um link com as instruções.
        </div>

        <v-text-field
          density="compact"
          color="secondary"
          v-model="formReset.email"
          :error-messages="formReset.errors.email"
          required
          placeholder="Digite o seu email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>
      </v-form>

      <v-btn
        @click="handleSubmitResetPassword"
        class="my-8"
        color="secondary"
        size="large"
        width="100%"
        rounded
        :loading="formReset.processing"
        :disabled="formReset.processing"
        text="Confirmar"
        type="submit"
        variant="outlined"
        block
      ></v-btn>

      <div class="text-caption mt-2 tw-cursor-pointer">
        <RouterLink class="text-decoration-underline" to="/login">Voltar ao login?</RouterLink>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
/* Estilos necessários */
</style>
