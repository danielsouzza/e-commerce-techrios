<script setup>
import {onMounted, ref} from "vue";
import AppLogo from "../components/ui-components/AppLogo.vue";
import Navigation from "./Navigation.vue";
import {Icon} from "@iconify/vue";
import MobileSidebar from "./MobileSidebar.vue";
import {routes} from "../services/fetch.js";

const appsdrawer = ref(false);
const auth = ref(null)

function getUser() {
  routes['user.me']().then((res) => {
    auth.value = res.data.data;
  })
}

onMounted(()=>{
  getUser()
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
              <div>
                <AppLogo />
              </div>
              <div class="d-flex align-center justify-end tw-gap-3">
                <div class="navigation d-lg-flex d-none">
                  <Navigation />
                </div>
                <RouterLink  :to="{name: 'login'}">
                  <v-btn variant="outlined" color="secondary" rounded class=" d-lg-flex d-none !tw-font-extrabold ">
                    <Icon icon="mdi:account-circle-outline" width="25"  class="mr-2"/> {{auth?.name ?? 'MINHA CONTA'}}
                  </v-btn>
                </RouterLink>

                <v-btn variant="flat" color="success" rounded  class="d-lg-flex d-none !tw-font-extrabold  ">
                  <Icon icon="ic:baseline-whatsapp" width="25"  class="mr-2 tw-text-white" /><span class="tw-text-white ">ATENDIMENTO</span>
                </v-btn>
              </div>
              <v-btn variant="text" class="hidden-lg-and-up " icon >
                <Icon icon="mdi:user-circle-outline"  width="35"/>
              </v-btn>
            </v-toolbar>
          </v-container>
        </v-app-bar>
      </v-layout>
    </div>

    <v-layout>
      <v-navigation-drawer class="lp-drawer" v-model="appsdrawer" location="left" temporary>
        <MobileSidebar />
      </v-navigation-drawer>
    </v-layout>

  </div>

</template>

<style scoped>


.my-toolbar::v-deep(.v-toolbar__content) {
  padding: 0;
  display: flex;
  justify-content: space-between;
  box-shadow: none !important;
}

</style>