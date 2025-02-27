<script setup>

import {computed, reactive, ref} from "vue";
import {routes} from "../services/fetch.js";
import router from "../routes/index.js";
import { useToast } from "vue-toastification";
import {useRoute} from "vue-router";

const toast = useToast();
const tab = ref('reset-password')
const route = useRoute();
const visible1 = ref(false);
const visible2 = ref(false);
const form = reactive({
  email: "",
  token:route.query.token,
  password: "",
  confirmPassword:""
})

const validatePassword = () => {
  if (!form.password || !form.confirmPassword) {
    return false;
  }
  const isValid = passwordRules.value.every(rule => rule.rule);
  return isValid && form.password === form.confirmPassword;
};

const passwordRules = computed(() => {
  return [
    { rule: form.password?.length >= 8, message: 'Pelo menos 8 caracteres' },
    { rule: /[A-Z]/.test(form.password), message: 'Pelo menos uma letra maiúscula' },
    { rule: /[a-z]/.test(form.password), message: 'Pelo menos uma letra minúscula' },
    { rule: /[0-9]/.test(form.password), message: 'Pelo menos um número' },
  ];
});

function handleSubmit() {

  if(validatePassword()){
    routes['user.reset-password-confirm'](form).then((response) => {
      if (response.data.success) {
        toast.success(response.data.message);
        goLoginPage()
      }
    }).catch(error => {
      toast.error(error.response.data.message);
    })
  }
}


function goLoginPage(){
  router.push({name: "login"})
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
      <v-tabs-window-item value="reset-password">
        <v-card
            class="mx-auto pa-8 pb-8 my-4"
            elevation="3"
            max-width="500"
            rounded="lg"
        >
          <div class="tw-flex tw-items-center  mb-5">
            <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
            <v-btn variant="outlined" color="secondary" rounded >
              <span class="tw-text-xs"> Redefinir senha</span>
            </v-btn>
            <v-divider  :thickness="1" class="border-opacity-100  " ></v-divider>
          </div>

          <v-form @submit.prevent="handleSubmit" validate-on="blur">
            <v-row class="my-5">
              <v-col cols="12"  >
                <div class="text-subtitle-1 text-medium-emphasis">Sua nova senha</div>
                <v-text-field
                    :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="visible1 ? 'text' : 'password'"
                    density="compact"
                    color="secondary"
                    hide-details="auto"
                    v-model="form.password"
                    placeholder="Digite sua nova senha"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    @click:append-inner="visible1 = !visible1"
                ></v-text-field>
                <v-list dense>
                  <v-list-item v-for="(rule, index) in passwordRules" :key="index">
                    <div class="tw-flex tw-gap-2 tw-items-center">
                      <v-icon v-if="rule.rule" color="green">mdi-check-circle</v-icon>
                      <v-icon v-else color="red">mdi-close-circle</v-icon>
                      <v-list-item-title>{{ rule.message }}</v-list-item-title>
                    </div>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12"  >
                <div class="text-subtitle-1 text-medium-emphasis">Confirme sua nova senha</div>

                <v-text-field
                    :append-inner-icon="visible2 ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="visible2 ? 'text' : 'password'"
                    density="compact"
                    color="secondary"
                    hide-details="auto"
                    v-model="form.confirmPassword"
                    placeholder="Digite novamente sua nova senha"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    @click:append-inner="visible2 = !visible2"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-btn
                class="mb-8"
                color="secondary"
                size="large"
                rounded
                type="submit"
                variant="outlined"
                block
            >
              confirma
            </v-btn>
          </v-form>

          <v-card-text class="text-center">
            <RouterLink  :to="{name: 'login'}">
              <div class="text-blue text-decoration-none">
                realizar login?<v-icon icon="mdi-chevron-right"></v-icon>
              </div>
            </RouterLink>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped>

</style>