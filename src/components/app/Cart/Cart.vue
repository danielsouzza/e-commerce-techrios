<script setup>
import {computed, ref, watch} from "vue";
import CartItem from "./CartItem.vue";
import {formatCurrency} from "../../../Helper/Ultis.js";
import {useCartStore} from "../../../store/CartStore.js";
import {Icon} from "@iconify/vue";

const props = defineProps({
  auth:Object
})

const showDialogDelete = ref(false)

defineEmits(['close'])


const orders = computed(()=>{
  return useCartStore().order?.passagens_agrupadas?.map(it=>{
    const images = it.trecho.municipio_destino?.imagens || []
    it.trecho.municipio_destino.random_image = []
    if (images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length)
      it.trecho.municipio_destino.random_image = images[randomIndex]
    }
    return {...it}
  })
})


watch(()=>props.auth,()=>{
  useCartStore().loadCart(props.auth)
})

</script>

<template>
  <v-dialog max-width="600" v-model="showDialogDelete">
    <template v-slot:default="{ isActive }">
      <v-card title="Limpar carrinho">
        <v-card-text>

          <div class="tw-w-full tw-flex tw-flex-col tw-items-center tw-pb-3 tw-text-center">
            <Icon icon="gg:info" width="30" class="icon"  />
            <span class="message mt-2">Você realmente deseja  excluir todas as passagens do seu carrinho? Essa ação não pode ser desfeita</span>
          </div>
        </v-card-text>

        <v-card-actions>

          <v-btn
              text="cancelar"
              @click="showDialogDelete = false"
          ></v-btn>
          <v-btn
              :disabled="useCartStore().loading"
              :loading="useCartStore().loading"
              variant="flat"
              color="primary"
              text="confirmar"
              @click="useCartStore().clearCart().finally(()=>{
                showDialogDelete = false
              })"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <div class="cart-container">
    <!-- Header Fixo -->
    <div class="cart-header">
      <v-card flat variant="text" color="" rounded="lg" class=" ma-5 pa-3 tw-text-lg tw-font-bold">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div> Meu carrinho</div>
          <Icon icon="carbon:close-outline" class="mr-2 tw-cursor-pointer !tw-text-red-500" width="30" @click="$emit('close')"/>
        </div>
      </v-card>
     
    </div>

    <!-- Conteúdo com Rolagem -->
    <div class="cart-content">
      <div v-if="!useCartStore().isEmptyCart()" class="tw-flex tw-flex-col tw-gap-3 px-3 mx-2 tw-overflow-y-auto">
        <CartItem v-for="item in orders" :data="item"/>
      </div>
      <div v-else class="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-text-indigo-500 tw-font-semibold px-3 mx-2">
        <Icon icon="mingcute:empty-box-line" class="mr-2" width="70"/>
        Nenhuma viagem adiciona ao seu carrinho
      </div>
    </div>

    <!-- Footer Fixo -->
    <div v-if="!useCartStore().isEmptyCart()" class="  bg-containerBg pb-5">
      <v-divider  :thickness="1"  class="border-opacity-100 tw-my-2 " ></v-divider>
      <v-row class="px-5">
        <v-col cols="6" class="tw-text-p tw-text-lg tw-font-bold">
          Total
        </v-col>
        <v-col cols="6"  class="tw-text-end tw-text-lg tw-font-bold">
          {{formatCurrency(useCartStore().getTotal())}}
        </v-col>
        <v-col md="4">
          <v-btn  @click="showDialogDelete = true" variant="text" color="prmary" rounded="lg" class="tw-w-full" size="large">
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
  </div>
</template>

<style scoped>
.cart-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background-color: white;
}

.cart-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  /* Ajusta o padding para não sobrepor o header/footer */
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(99 102 241);
  font-weight: 600;
  text-align: center;
  gap: 1rem;
}

.cart-footer {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 10;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: env(safe-area-inset-bottom); /* Suporte para iPhones com notch */
}

/* Adiciona uma sombra suave ao header e footer quando há rolagem */
.cart-header, .cart-footer {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

/* Estilização da barra de rolagem */
.cart-content::-webkit-scrollbar {
  width: 6px;
}

.cart-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.cart-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.cart-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animações suaves */
.cart-items > * {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .cart-container {
    height: 100dvh; /* Viewport height dinâmico para mobile */
  }
  
  .cart-footer {
    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
  }
}
</style>