<script setup >
import AppLogo from "../components/ui-components/AppLogo.vue";
import {userAuthStore} from "../store/AuthStore.js";
import router from "../routes/index.js";
import {routes} from "../services/fetch.js";


const emit = defineEmits(['close'])

function goToLoginPage(){
  router.push({name: "login"})
}

function goToSalePage(){
  router.push({name: "home"})
}

function logout() {
  routes['user.logout']().then((res) => {
    userAuthStore().logout()
    goToSalePage()
  }).catch((err) => {
    userAuthStore().logout()
    goToSalePage()
  })
}

function scrollToStartDiv(){
  emit('close')
  const minhaDiv = document.getElementById("mais-buscados");
  minhaDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

</script>


<template>
    <div class="pt-6 lp-mobile-sidebar">
        <div class="ml-6 mb-3">
            <AppLogo />
        </div>
        <v-list class="">
            <v-list-item rounded="md">
              <RouterLink  :to="{name: 'super-ofertas'}">
                <v-btn   rounded="sm" variant="text">
                  <span class="tw-text-p">SUPER OFERTAS</span>
                </v-btn>
              </RouterLink>
            </v-list-item>
            <v-list-item rounded="md">
              <v-btn @click="scrollToStartDiv"  :ripple="false" rounded="sm" variant="text" color="primary">
                <span class="tw-text-p">MAIS PROCURADOS</span>

              </v-btn>
            </v-list-item>
          <v-list-item v-if="userAuthStore().isAuthenticated()" @click="logout" color="secondary" class="tw-cursor-pointer">
            <v-btn  :ripple="false" rounded="sm" variant="text" color="primary">
              <span class="tw-text-p">Sair</span>
            </v-btn>
          </v-list-item>
          <v-list-item v-else @click="goToLoginPage" color="secondary" class="tw-cursor-pointer">
            <v-btn  :ripple="false" rounded="sm" variant="text" color="primary">
              <span class="tw-text-p">Entrar</span>
            </v-btn>
          </v-list-item>
        </v-list>
    </div>
</template>
