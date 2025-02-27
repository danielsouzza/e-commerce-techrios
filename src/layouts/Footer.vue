<script setup>
import AppLogo from "../components/ui-components/AppLogo.vue";
import ListExpensiveItem from "../components/app/ListExpensiveItem.vue";
import CardNewLetters from "../components/shared/CardNewLetters.vue";
import MostPopularDestinations from "../components/shared/MostPopularDestinations.vue";
import {userAuthStore} from "../store/AuthStore.js";
import {Icon} from "@iconify/vue";




</script>

<template>

  <div class="relative  " >
    <MostPopularDestinations  :class="userAuthStore().isAuthenticated() ? '!tw-pb-[10px]' : '!tw-pb-[80px]'"  />

    <div class="tw-flex tw-flex-col  tw-w-full tw-bg-primary tw-px-3 ">
      <CardNewLetters v-if="!userAuthStore().isAuthenticated()" class="maxWidth  tw-top-[-100px]  !tw-mb-[-100px] lg:tw-top-[-50px] lg:!tw-mb-[-20px] " />
      <div class="tw-flex tw-flex-col  tw-w-full maxWidth" :class="userAuthStore().isAuthenticated() ? 'tw-pt-10' : ''">
        <div class="tw-flex tw-flex-col tw-w-full lg:tw-flex-row lg:tw-justify-start lg:tw-gap-5 ">
          <div class="tw-flex tw-flex-col tw-items-center lg:tw-items-start  tw-w-full ">
            <div class="py-5">
              <AppLogo footer size="190" />
            </div>
          </div>
          <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 lg:!tw-hidden" color="secondary"></v-divider>
          <ListExpensiveItem title="Atendimento" class="tw-w-full ">
            <p class="tw-font-normal"> De segunda a sexta das 07 às 22h</p>
            <p class="tw-font-normal">Sábado, domingo e feriado das 09h às 18h</p>
          </ListExpensiveItem>
          <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 lg:!tw-hidden" color="secondary"></v-divider>
          <ListExpensiveItem title="Institucional" class="tw-w-full ">
            <ul>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Quem somos
                </RouterLink>
              </li>

              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Vantagens
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'institucional'}">
                  Como funciona?
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'institucional'}">
                  Duvidas Frequentes
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Politicas e privacidades
                </RouterLink>
              </li>
            </ul>

          </ListExpensiveItem>
          <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 lg:!tw-hidden" color="secondary"></v-divider>
          <ListExpensiveItem title="Links Úteis" class="tw-w-full">
            <ul>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Destinos
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Hidroviárias
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'institucional'}">
                  Embarcações
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'institucional'}">
                  Passagens promocionais
                </RouterLink>
              </li>
              <li class="tw-pb-1 tw-font-normal">
                <RouterLink  :to="{name: 'home'}">
                  Cupons de descontos
                </RouterLink>
              </li>
            </ul>
          </ListExpensiveItem>
          <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 lg:!tw-hidden" color="secondary"></v-divider>
          <div class="tw-w-full">
            <ListExpensiveItem title="Guia de Viagem" class="tw-w-full">
              <ul>
                <li class="tw-pb-1 tw-font-normal">
                  <RouterLink  :to="{name: 'home'}">
                    Destinos mais buscados
                  </RouterLink>
                </li>
                <li class="tw-pb-1 tw-font-normal">
                  <RouterLink  :to="{name: 'home'}">
                    Guia de hotéis
                  </RouterLink>
                </li>
              </ul>
            </ListExpensiveItem>
            <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 lg:!tw-hidden" color="secondary"></v-divider>
            <v-card class="mt-5 tw-w-full">
              <v-list  class="py-0 px-0 ">
                <v-list-group >
                  <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        <p ><small>Sites das embarcações</small></p>
                      </template>
                    </v-list-item>
                  </template>
                  <v-list-item title=""></v-list-item>
                </v-list-group>
              </v-list>
            </v-card>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-mt-4 " color="secondary"></v-divider>
        <div class="tw-flex tw-flex-col tw-justify-center lg:tw-justify-between lg:tw-flex-row tw-gap-5 tw-items-center mt-5 tw-w-full tw-py-4 mb-2">
          <div class="tw-flex tw-gap-4  tw-items-center">
            <img src="/assets/images/footer/cadastur.svg" alt="" width="90"/>
            <p class="tw-text-secondary tw-text-[12px] tw-font-[800]">COMPRA 100% SEGURA</p>
          </div>
          <div class="tw-flex tw-gap-4  tw-items-center ">
            <Icon icon="ic:baseline-pix" width="30" class=" tw-text-xl tw-text-secondary"/>
            <Icon icon="ri:visa-line" width="40" class=" tw-text-xl tw-text-secondary"/>
            <Icon icon="lineicons:mastercard" width="40" class=" tw-text-xl tw-text-secondary"/>
            <Icon icon="fontisto:american-express" width="40" class=" tw-text-xl tw-text-secondary"/>
            <img src="/assets/images/footer/elo.svg" alt="" width="60"/>
            <img src="/assets/images/footer/hipercard.svg" alt="" width="60"/>
          </div>
          <div class="tw-flex tw-flex-col tw-justify-center tw-gap-10 lg:tw-flex-row hidden-md-and-down tw-items-center   ">
            <div class="tw-flex tw-gap-4  tw-items-center">
              <p class="tw-text-secondary tw-text-[15px] tw-font-[800]">SIGA A YJARA</p>
            </div>
            <div class="tw-flex tw-gap-2  tw-items-center ">
              <a href="https://www.instagram.com/yjaraviagens/" target="_blank">
                <Icon icon="mdi:instagram" width="40" class=" tw-text-xl tw-text-secondary"/>
              </a>
              <a href="https://www.instagram.com/yjaraviagens/" target="_blank">
                <Icon icon="ic:baseline-facebook" width="40" class=" tw-text-xl tw-text-secondary"/>
              </a>
              <a href="https://www.instagram.com/yjaraviagens/" target="_blank">
                <Icon icon="mdi:youtube" width="40" class=" tw-text-xl tw-text-secondary"/>
              </a>
            </div>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 hidden-md-and-up" color="secondary"></v-divider>
        <div class="tw-flex tw-flex-col tw-justify-center  tw-items-center mt-3 tw-w-full tw-pt-4 mb-2 hidden-md-and-up">
          <div class="tw-flex tw-gap-4  tw-items-center">
            <p class="tw-text-secondary tw-text-[12px] tw-font-[800]">SIGA TECHRIOS</p>
          </div>
          <div class="tw-flex tw-gap-2  tw-items-center mt-4">
            <a href="#">
              <img src="/assets/images/footer/instagram.svg" alt="" width="40"/>
            </a>
            <a href="#">
              <img src="/assets/images/footer/facebook.svg" alt="" width="40"/>
            </a>
            <a href="#">
              <img src="/assets/images/footer/youtube.svg" alt="" width="40"/>
            </a>
          </div>
        </div>
        <v-divider  :thickness="1" class="border-opacity-25 tw-my-2 " color="secondary"></v-divider>
        <div class="tw-flex tw-flex-col tw-justify-center  tw-items-center my-3 tw-w-full  mb-2">
          <div class="tw-flex tw-flex-col tw-justify-center tw-items-center lg:tw-flex-row lg:tw-justify-between tw-w-full tw-gap-4">
            <div class="tw-flex tw-gap-2  tw-items-center ">
              <img src="/assets/images/footer/logo-w3.svg" alt="" width="140"/>
              <div class="tw-flex tw-gap-2  tw-items-center  tw-text-secondary tw-text-[10px]">
                <p>2024 © Todos os direitos reservados.</p>
              </div>
            </div>
            <div class="tw-flex tw-gap-2  tw-items-center  tw-text-secondary tw-text-[12px]">
              <a href="#">Investidores</a>
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
