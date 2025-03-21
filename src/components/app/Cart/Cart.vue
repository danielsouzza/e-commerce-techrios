<script setup>
import {computed, watch} from "vue";
import CartItem from "./CartItem.vue";
import {formatCurrency} from "../../../Helper/Ultis.js";
import {useCartStore} from "../../../store/CartStore.js";
import {Icon} from "@iconify/vue";
import {routes} from "../../../services/fetch.js";
import {email} from "@vuelidate/validators";

const props = defineProps({
  auth:Object
})

defineEmits(['close'])


const orders = computed(()=>{
  return useCartStore().order
})

function removerRoom(params){
  routes["order.delete"](params.pedido,params).then(response => {
    useCartStore().loadCart()
  })
}

watch(()=>props.auth,()=>{
  useCartStore().loadCart(props.auth)
})

</script>

<template>
  <div class="tw-flex tw-flex-col">
    <v-card flat variant="tonal" color="secondary" rounded="lg" class=" ma-5 pa-3 tw-text-lg tw-font-bold">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div> Meu carrinho</div>
        <Icon icon="carbon:close-outline" class="mr-2 tw-cursor-pointer" width="30" @click="$emit('close')"/>
      </div>
    </v-card>
  </div>
  <div v-if="!useCartStore().isEmptyCart()" class="tw-flex tw-flex-col tw-gap-3 px-3 mx-2">
    <CartItem v-for="item in orders?.passagens_agrupadas" :data="item"/>
  </div>
  <div v-else class="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-text-indigo-500 tw-font-semibold px-3 mx-2">
    <Icon icon="mingcute:empty-box-line" class="mr-2" width="70"/>
    Nenhuma viagem adiciona ao seu carrinho
  </div>

  <div v-if="!useCartStore().isEmptyCart()" class=" userbottom bg-containerBg pb-5">
    <v-divider  :thickness="1"  class="border-opacity-100 tw-my-2 " ></v-divider>
    <v-row class="px-5">
      <v-col cols="6" class="tw-text-p tw-text-lg tw-font-bold">
        Total
      </v-col>
      <v-col cols="6"  class="tw-text-end tw-text-lg tw-font-bold">
        {{formatCurrency(useCartStore().getTotal())}}
      </v-col>
      <v-col md="4">
        <v-btn @click="useCartStore().clearCart()" variant="text" color="prmary" rounded="lg" class="tw-w-full" size="large">
          Limpar carrinho
        </v-btn>
      </v-col>
      <v-col  >
        <RouterLink :to="{name:'sale',params:{tab:'pagamento'}}">
          <v-btn color="primary" rounded="lg" class="tw-w-full" size="large"> Finalizar compra </v-btn>
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