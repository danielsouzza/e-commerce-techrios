<script setup>

import {reactive, ref} from "vue";
import {routes} from "../services/fetch.js";
import router from "../routes/index.js";
import {userAuthStore} from "../store/AuthStore.js";
import {useCartStore} from "../store/CartStore.js";
import {showErrorNotification} from "../event-bus.js";


const authStore = userAuthStore()
const visible = ref(false);
const form = reactive({
  email: "",
  password: "",
  remember: false,
  errors:{}
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
  validateField('password', 'Por favor, insira sua senha.');

  return Object.keys(form.errors).length === 0;
};


function handleSubmit() {

  if(validateStepForm()){
    routes['user.login'](form).then((response) => {
      console.log(response.data);
      if (response.data.success) {
        authStore.setToken(response.data.data.token);
        authStore.loadUser();
        useCartStore().syncCart()
        goToHomePage()
      }
    }).catch(error => {
      showErrorNotification('Credenciais inválidas. Verifique seus dados e tente novamente.');
    })
  }
}

function goToHomePage(){
  router.push({name: "home"})
}

</script>

<template>
  <v-card  color="primary" rounded="0"  class="!tw-py-6">
    <div class="maxWidth tw-flex  !tw-justify-center tw-flex-col tw-items-center lg:tw-items-start ">
      <div class="text-center lg:tw-text-start tw-py-2 px-5 tw-text-2xl  tw-text-secondary"><strong class="tw-font-bold">Àrea do Cliente</strong> </div>
    </div>
  </v-card>

  <div class="maxWidth tw-px-3 ">
    <v-card
        class="mx-auto pa-8 pb-8 my-4"
        elevation="3"
        max-width="500"
        rounded="lg"
    >
      <div class="tw-flex tw-items-center  mb-5">
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
        <v-btn variant="outlined" color="secondary" rounded >
          <span class="tw-text-xs"> Acessar</span>
        </v-btn>
        <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
      </div>

      <v-form @submit.prevent="handleSubmit" validate-on="blur">
        <div class="text-subtitle-1 text-medium-emphasis">Seu email</div>

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

        <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
          Sua senha
          <a
              class="text-caption text-decoration-none text-blue"
              href="#"
              rel="noopener noreferrer"
              target="_blank"
          >
            Esqueci minha senha?</a>
        </div>

        <v-text-field
            color="secondary"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="compact"
            v-model="form.password"
            :error-messages="form.errors.password"
            required
            placeholder="Digite sua senha"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            @click:append-inner="visible = !visible"
        ></v-text-field>


        <v-btn
            class="mb-8"
            color="secondary"
            size="large"
            rounded
            type="submit"
            variant="outlined"
            block
        >
          Entrar
        </v-btn>
      </v-form>


      <v-card-text class="text-center">
          <RouterLink  :to="{name: 'register'}">
            <div class="text-blue text-decoration-none">
              Criar uma conta?<v-icon icon="mdi-chevron-right"></v-icon>
            </div>
          </RouterLink>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>

</style>