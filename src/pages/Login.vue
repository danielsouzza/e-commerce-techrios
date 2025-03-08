<script setup>

import {reactive, ref} from "vue";
import {routes} from "../services/fetch.js";
import router from "../routes/index.js";
import {userAuthStore} from "../store/AuthStore.js";
import {useCartStore} from "../store/CartStore.js";
import {getAppBaseUrl} from "../services/api.js";
import {showErrorNotification, showSuccessNotification} from "../event-bus.js";


const visible = ref(false);
const tab = ref('login')

const formReset = reactive({
  email: '',
  base_url:getAppBaseUrl(),
  errors:{},
  processing:false
})

const form2fa = reactive({
  email: '',
  verification_code:'',
  subdomain: window.subdomain || '',
  errors:{},
  processing:false

})
const form = reactive({
  email: "",
  password: "",
  remember: false,
  subdomain: window.subdomain || '',
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
  validateField('password', 'Por favor, insira sua senha.');

  return Object.keys(form.errors).length === 0;
};

const validateStepForm2fa = () => {
  form2fa.errors = {};
  const validateField = (field, errorMessage) => {
    if (!form2fa[field]) {
      form2fa.errors[field] = errorMessage;
    } else {
      delete form2fa.errors[field];
    }
  };

  validateField('verification_code', 'Por favor, insira seu email.');

  return Object.keys(form2fa.errors).length === 0;
};


function handleSubmit() {

  if(validateStepForm()){
    form.processing = true
    routes['user.login'](form).then((response) => {
      if (response.data.success) {
        tab.value = 'confirm-auth-2fa'
        form2fa.email = form.email
        showSuccessNotification(response.data.message);
      }
      form.processing = false
    }).catch(error => {
      form.processing = false
      showErrorNotification(error.response.data.data.error);
    })
  }
}

function handleSubmitResetPassword() {
  if(!formReset.email){
    formReset.errors['email'] = "Por favor, insira seu email."
  }else{
    formReset.processing = true
    routes['user.reset-password'](formReset).then((response) => {
      if (response.data.success) {
        showSuccessNotification(response.data.message);
      }
      formReset.processing = false
    }).catch(error => {
      formReset.processing = false
      showErrorNotification(error.response.data.data.error);
    })
  }
}

function confirm2fat(){
  if(validateStepForm2fa()){
    form2fa.processing = true
    routes['user.login.2fa'](form2fa).then((response) => {
      if(response.data.success){
        userAuthStore().setToken(response.data.data.token);
        userAuthStore().loadUser();
        useCartStore().syncCart()
        goToHomePage()
      }
      form2fa.processing = false
    }).catch(error=>{
      form2fa.processing = false
      showErrorNotification(error.response.data.data.error);
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
    <v-tabs-window v-model="tab" class="mb-3">
      <v-tabs-window-item value="login">
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
                  @click="tab = 'reset-password'"
                  class="text-caption text-decoration-none text-blue"
                  href="#"
                  rel="noopener noreferrer"
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
                :loading="form.processing"
                :disabled="form.processing"
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
      </v-tabs-window-item>
      <v-tabs-window-item value="confirm-auth-2fa">
        <v-card
            class="mx-auto pa-8 pb-8 my-4 tw-text-center"
            elevation="3"
            max-width="500"
            rounded="lg"
        >
          <h3 class="text-h6 mb-4">Confirme o código </h3>

          <div class="text-body-2">
            Enviamos um código de verificação para {{form2fa.email}} <br>

            Verifique seu e-mail e cole o código abaixo.
          </div>

          <v-sheet color="surface">
            <v-otp-input
                v-model="form2fa.verification_code"
                type="text"
                variant="solo"
            ></v-otp-input>
          </v-sheet>

          <v-btn
              @click="confirm2fat"
              class="my-8"
              color="secondary"
              size="large"
              width="100%"
              rounded
              :loading="form2fa.processing"
              :disabled="form2fa.processing"
              text="Confirmar"
              type="submit"
              variant="outlined"
              block
          ></v-btn>

          <div class="text-caption ">
            Não recebeu o código? <a class="text-decoration-underline tw-cursor-pointer" @click="handleSubmit" @click.prevent="form2fa.verification_code = ''">Reenviar</a>
          </div>

        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="reset-password">
        <v-card
            class="mx-auto pa-8 pb-8 my-4 tw-text-center"
            elevation="3"
            max-width="500"
            rounded="lg"
        >

          <div class="tw-flex tw-items-center  mb-5">
            <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
            <v-btn variant="outlined" color="secondary" rounded >
              <span class="tw-text-xs"> Esqueci minha senha</span>
            </v-btn>
            <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
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
                placeholder="Digite o seu email "
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

<!--          <div class="text-caption">-->
<!--            Não recebeu o link? <a class="text-decoration-underline" @click="handleSubmitResetPassword" href="#" @click.prevent="">Reenviar</a>-->
<!--          </div>-->
          <div class="text-caption mt-2 tw-cursor-pointer">
            <a class="text-decoration-underline" @click="tab = 'login'" href="#" @click.prevent=""> Voltar ao login?</a>
          </div>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped>

</style>