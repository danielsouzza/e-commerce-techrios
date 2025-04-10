<script setup>
import {computed, onMounted, ref, watch} from "vue";
import AppLogo from "../components/ui-components/AppLogo.vue";
import Navigation from "./Navigation.vue";
import {Icon} from "@iconify/vue";
import MobileSidebar from "./MobileSidebar.vue";
import {routes} from "../services/fetch.js";
import Cart from "../components/app/Cart/Cart.vue";
import {userAuthStore} from "../store/AuthStore.js";
import router from "../routes/index.js";
import {useCartStore} from "../store/CartStore.js";

const authStore = userAuthStore()
const appsdrawer = ref(false);
const menu = ref(false);
const menuMobile = ref(false);
const showCart = ref(false);

const isInterprise = computed(()=>{
  return !!window.subdomain
})

const isAuthenticated = computed(()=>{
  return !!authStore.user
})
function goToSalePage(){
  router.push({name: "home"})
}

function goToLoginPage(){
  window.location = "/login"
}


function logout() {
  routes['user.logout']().then((res) => {
    authStore.logout()
    goToSalePage()
  }).catch((err) => {
    authStore.logout()
    goToSalePage()
  })
}

function getFirstAndLastName() {
  if(authStore.user?.name){
    const nameParts = authStore.user?.name.split(/\s+/); // Remove espaços extras e divide pelo espaço

    if (nameParts.length === 1) {
      return  nameParts[0];
    }

    return nameParts[0] + ' '+ nameParts[nameParts.length - 1]
  }

  return 'MINHA CONTA'
}


watch(()=>showCart.value, ()=>{
  if (showCart.value) {
    document.documentElement.style.overflowY  = "hidden";
  } else {
    document.documentElement.style.overflowY  = "scroll";
  }
})

onMounted(()=>{
  authStore.loadUser()
  useCartStore().loadCart()
})


</script>

<template>

  <div>
    <div>
      <v-layout>

        <v-app-bar height="70" class="my-app !tw-border-t-4 !tw-border-secondary" flat>
          <v-container class="maxWidth py-sm-4 py-0">

            <v-toolbar class="d-flex align-center bg-surface my-toolbar">
              <v-btn variant="text" class="hidden-lg-and-up " icon @click.stop="appsdrawer = !appsdrawer">
                <Icon icon="fluent:line-horizontal-3-16-filled" width="25"/>
              </v-btn>

              <RouterLink  :to="{name: 'home'}">
                <AppLogo />
              </RouterLink>
              <div class="d-flex align-center justify-end tw-gap-3">
                <div class="navigation d-lg-flex d-none">
                  <Navigation />
                </div>
                <v-badge
                    class="hidden-md-and-down"
                    v-if="useCartStore().getCountTickets() > 0"
                    color="info"
                    :content="useCartStore().getCountTickets()"
                >
                  <v-btn variant="outlined" color="secondary"  icon  size="small"   class="d-lg-flex d-none !tw-font-extrabold" @click="showCart = true">
                    <Icon icon="mdi:cart-outline" width="20"  class=" " />
                  </v-btn>
                </v-badge>
                <v-btn v-else variant="outlined" color="secondary"  icon  size="small"   class="d-lg-flex d-none !tw-font-extrabold" @click="showCart = true">
                  <Icon icon="mdi:cart-outline" width="20"  class=" " />
                </v-btn>

                <v-btn  v-if="!isAuthenticated"  @click="goToLoginPage" variant="outlined" color="secondary" rounded class=" d-lg-flex d-none !tw-font-extrabold ">
                  <Icon icon="mdi:account-circle-outline" width="25"  class="mr-2"/> Fazer login
                </v-btn>

                <v-menu
                    v-else
                    transition="slide-x-transition"
                    v-model="menu"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn  v-bind="props" variant="outlined" color="secondary" rounded class=" d-lg-flex d-none !tw-font-extrabold ">
                      <Icon icon="mdi:account-circle-outline" width="25"  class="mr-2"/> {{getFirstAndLastName()}}
                    </v-btn>
                  </template>
                  <v-card class="mt-1">
                    <v-list>
                      <v-list-item>
                        <RouterLink  :to="{name: 'area-do-cliente',params:{tab:'perfil'}}">
                          Meu perfil
                        </RouterLink>
                      </v-list-item>


                      <v-list-item>
                        <RouterLink  :to="{name: 'area-do-cliente',params:{tab:'pedidos'}}">
                          Meus pedidos
                        </RouterLink>
                      </v-list-item>

                      <v-list-item v-if="authStore.isAuthenticated()" @click="logout" color="secondary" class="tw-cursor-pointer">
                          Sair
                      </v-list-item>
                      <v-list-item v-else @click="goToLoginPage" color="secondary" class="tw-cursor-pointer">
                        Entrar
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
                <a  v-if="!isInterprise" href="https://wa.me/559391893803?text=Olá,%20gostaria%20de%20mais%20informações!" target="_blank">
                  <v-btn   variant="flat" color="success" rounded  class="d-lg-flex d-none !tw-font-extrabold  ">
                    <Icon icon="ic:baseline-whatsapp" width="25"  class="mr-2 tw-text-white" /><span class="tw-text-white ">ATENDIMENTO</span>
                  </v-btn>
                </a>

              </div>
              <v-menu
                  transition="slide-x-transition"
                  v-model="menuMobile"
              >
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text" class="hidden-lg-and-up " icon >
                    <Icon icon="mdi:user-circle-outline"  width="35"/>
                  </v-btn>
                </template>

                <v-card class="mt-1">
                  <v-list>
                    <v-list-item>
                      <RouterLink  :to="{name: 'area-do-cliente',params:{tab:'perfil'}}">
                        Perfil
                      </RouterLink>
                    </v-list-item>

                    <v-list-item @click="showCart = true">
                      Carrinho
                    </v-list-item>

                    <v-list-item>
                      <RouterLink  :to="{name: 'area-do-cliente',params:{tab:'pedidos'}}">
                        Pedidos
                      </RouterLink>
                    </v-list-item>

                    <v-list-item v-if="authStore.isAuthenticated()" @click="logout" color="secondary" class="tw-cursor-pointer">
                      Sair
                    </v-list-item>
                    <v-list-item v-else @click="goToLoginPage" color="secondary" class="tw-cursor-pointer">
                      Entrar
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>

            </v-toolbar>
          </v-container>
        </v-app-bar>
      </v-layout>
    </div>

    <v-layout>
      <v-navigation-drawer elevation="10" location="right" v-model="showCart"  width="600" temporary >
        <Cart :auth="authStore.user" @close="showCart = false"/>
      </v-navigation-drawer>
      <v-navigation-drawer class="lp-drawer" v-model="appsdrawer" location="left" temporary>
        <MobileSidebar @close="appsdrawer=false" />
      </v-navigation-drawer>
    </v-layout>

  </div>

</template>

<style scoped>

.v-navigation-drawer__scrim{
  position: fixed !important;
}

.my-toolbar::v-deep(.v-toolbar__content) {
  padding: 0;
  display: flex;
  justify-content: space-between;
  box-shadow: none !important;
}

</style>