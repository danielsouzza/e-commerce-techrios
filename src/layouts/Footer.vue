<script setup>
import AppLogo from "../components/ui-components/AppLogo.vue";
import ListExpensiveItem from "../components/app/ListExpensiveItem.vue";
import CardNewLetters from "../components/shared/CardNewLetters.vue";
import MostPopularDestinations from "../components/shared/MostPopularDestinations.vue";




</script>

<template>

  <v-container class="tw-bg-primary  ">
    <div class="tw-flex tw-flex-col  " >
      <MostPopularDestinations  />
      <div class="tw-h-[300px] tw-w-full tw-relative">
        <div class="tw-h-1/2 tw-w-full tw-bg-secondary"></div>
        <div class="tw-h-1/2 tw-w-full tw-bg-primary"></div>
        <div class="tw-absolute tw-inset-0 tw-flex tw-justify-center tw-items-center px-5">
          <CardNewLetters />
        </div>
      </div>
      <div class="tw-flex tw-flex-col  tw-w-full ">
        <div class="tw-flex tw-flex-col tw-items-center  tw-w-full ">
          <div class="py-5">
            <AppLogo footer size="190" />
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <ListExpensiveItem title="Atendimento">
          <p>De segunda a sexta das 07 às 22h</p>
          <p>Sábado, domingo e feriado das 09h às 18h</p>
        </ListExpensiveItem>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <ListExpensiveItem title="Institucional">
          <p>De segunda a sexta das 07 às 22h</p>
          <p>Sábado, domingo e feriado das 09h às 18h</p>
        </ListExpensiveItem>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <ListExpensiveItem title="Links Úteis">
          <p>De segunda a sexta das 07 às 22h</p>
          <p>Sábado, domingo e feriado das 09h às 18h</p>
        </ListExpensiveItem>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <ListExpensiveItem title="Guia de Viagem">
          <p>De segunda a sexta das 07 às 22h</p>
          <p>Sábado, domingo e feriado das 09h às 18h</p>
        </ListExpensiveItem>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <v-card class="mt-5">
          <v-list  class="py-0 px-0 ">
            <v-list-group >
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props">
                  <template v-slot:title>
                    <p ><small>Sites das embarcações</small></p>
                  </template>
                </v-list-item>
              </template>
              <v-list-item
                  title="Erlon Nav"
              ></v-list-item>
            </v-list-group>
          </v-list>
        </v-card>
        <div class="tw-flex tw-flex-col tw-justify-center  tw-items-center mt-5 tw-w-full tw-pt-4 mb-2">
          <div class="tw-flex tw-gap-4  tw-items-center">
            <img src="../assets/images/footer/cadastur.svg" alt="" width="90"/>
            <p class="tw-text-secondary tw-text-[12px] tw-font-[800]">COMPRA 100% SEGURA</p>
          </div>
          <div class="tw-flex tw-gap-4  tw-items-center mt-4">
            <img src="../assets/images/footer/pix.svg" alt="" width="30"/>
            <img src="../assets/images/footer/visa.svg" alt="" width="30"/>
            <img src="../assets/images/footer/mastercard.svg" alt="" width="30"/>
            <img src="../assets/images/footer/america_express.svg" alt="" width="30"/>
            <img src="../assets/images/footer/elo.svg" alt="" width="30"/>
            <img src="../assets/images/footer/hipercard.svg" alt="" width="30"/>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <div class="tw-flex tw-flex-col tw-justify-center  tw-items-center mt-3 tw-w-full tw-pt-4 mb-2">
          <div class="tw-flex tw-gap-4  tw-items-center">
            <p class="tw-text-secondary tw-text-[12px] tw-font-[800]">SIGA O TECHRIOS</p>
          </div>
          <div class="tw-flex tw-gap-2  tw-items-center mt-4">
            <a href="#">
              <img src="../assets/images/footer/instagram.svg" alt="" width="40"/>
            </a>
            <a href="#">
              <img src="../assets/images/footer/facebook.svg" alt="" width="40"/>
            </a>
            <a href="#">
              <img src="../assets/images/footer/youtube.svg" alt="" width="40"/>
            </a>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <div class="tw-flex tw-flex-col tw-justify-center  tw-items-center mt-3 tw-w-full  mb-2">
          <div class="tw-flex tw-gap-2  tw-items-center mt-3">
            <img src="../assets/images/footer/logo-w3.svg" alt="" width="140"/>
          </div>
          <div class="tw-flex tw-gap-2  tw-items-center mt-5 tw-text-secondary tw-text-[12px]">
            <a href="#">Investidores</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>
          <div class="tw-flex tw-gap-2  tw-items-center mt-3 tw-text-secondary tw-text-[10px]">
            <p>2024 © Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  </v-container>

</template>

<style scoped>

</style>
