<script setup>
import {computed, watch} from "vue";
import CartItem from "./CartItem.vue";
import {formatCurrency} from "../../../Helper/Ultis.js";
import {useCartStore} from "../../../store/CartStore.js";
import {Icon} from "@iconify/vue";

const props = defineProps({
  auth:Object
})

const cartStore = useCartStore()


const orders = computed(()=>{
  return cartStore.order
})

watch(()=>props.auth,()=>{
  cartStore.loadCart(props.auth)
})

</script>

<template>
  <div class="tw-flex tw-flex-col">
    <v-card flat variant="tonal" color="secondary" rounded="lg" class="tw-text-center ma-5 pa-3 tw-text-lg tw-font-bold">Minhas Viagens</v-card>
  </div>
  <div v-if="!cartStore.isEmptyCart()" class="tw-flex tw-flex-col tw-gap-3 px-3 mx-2">
    <CartItem v-for="item in orders?.passagens_agrupadas" :data="item"/>
  </div>
  <div v-else class="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-text-indigo-500 tw-font-semibold px-3 mx-2">
    <Icon icon="mingcute:empty-box-line" class="mr-2" width="70"/>
    Nenhuma viagem adiciona ao seu carrinho
  </div>

  <div v-if="!cartStore.isEmptyCart()" class=" userbottom bg-containerBg pb-5">
    <v-divider  :thickness="1"  class="border-opacity-100 tw-my-2 " ></v-divider>
    <v-row class="px-5">
      <v-col class="tw-text-p tw-text-lg tw-font-bold">
        Total
      </v-col>
      <v-col class="tw-text-end tw-text-lg tw-font-bold">
        {{formatCurrency(orders?.total)}}
      </v-col>
      <v-col cols="12" >
        <RouterLink :to="{name:'sale',params:{tab:'pagamento'}}">
          <v-btn color="primary" rounded="lg" class="tw-w-full" size="large">Processar pedido</v-btn>
        </RouterLink>
      </v-col>
    </v-row>

  </div>
</template>

<style scoped>
.userbottom {
  bottom: 0px;
  width: 100%;
  position:fixed;
  z-index: 2;
}
</style>