<script setup>

import {formatCurrency} from "../../../Helper/Ultis.js";
import {computed, ref} from "vue";
import {Icon} from "@iconify/vue";
import {useCartStore} from "../../../store/CartStore.js";
import TravelImages from "../../shared/TravelImages.vue";
import {VIcon} from "vuetify/components";
import {showErrorNotification} from "../../../event-bus.js";

const props = defineProps({
  data:Object
})

const openRooms = ref(false);
const showDialogDelete = ref(false)
const loadingDelete = ref(false)
const comodoToDelete = ref(null)
const valorTotal = computed(()=>{
  const valor = props.data.passagem_pedidos.reduce((acc, item)=> {
    if(item.deleted_at){
      return acc
    }
    return acc + item.valor
  },0)
  const taxa  = props.data.passagem_pedidos.reduce((acc, item)=> {
    if(item.deleted_at){
      return acc
    }
    return acc + item.taxa_embarque
  },0)
  return {
    total:valor,
    taxa:taxa,
  };
})

function setToDelete(item){
  comodoToDelete.value = item
  showDialogDelete.value = true
}


function confirmDelete(){
  loadingDelete.value = true
  useCartStore().removerItem({pedido_id:comodoToDelete.value.pedido_id,comodos_ids:[comodoToDelete.value.comodo.id],viagem_id:props.data.viagem.id}).then(()=>{
    loadingDelete.value = false
    showDialogDelete.value = false
    comodoToDelete.value = null
  }).catch((error)=>{
      if (error.response && error.response.status === 404) {
          useCartStore().clearCart()
      }
    loadingDelete.value = false
    showErrorNotification('Erro ao remover passagem, tente novamente mais tarde.')
  })

}


function onOpenRooms(){
  openRooms.value = !openRooms.value
}


</script>

<template>
  <v-dialog max-width="600" v-model="showDialogDelete">
    <template v-slot:default="{ isActive }">
      <v-card title="Excluir passagem">
        <v-card-text>

          <div class="tw-w-full tw-flex tw-flex-col tw-items-center tw-pb-3 tw-text-center">
            <Icon icon="gg:info" width="30" class="icon"  />
            <span class="message mt-2">Você realmente deseja  excluir essa passagem? Essa ação não pode ser desfeita</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
              text="cancelar"
              @click="showDialogDelete = false"
          ></v-btn>
          <v-btn
              :disabled="loadingDelete"
              :loading="loadingDelete"
              variant="flat"
              color="primary"
              text="confirmar"
              @click="confirmDelete"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-card variant="outlined" rounded="lg" class="!tw-p-4 !tw-border-secondary !tw-bg-white">
    <div class="tw-flex  mt-3 tw-w-full ">
      <v-row>
          <v-col cols="12" sm="6" md="6" lg="4">
              <TravelImages :alt="data.trecho.municipio_destino?.nome" :images="[data.trecho.municipio_destino.random_image]" class="bg-grey-lighten-2 lg:!tw-w-[120px] lg:!tw-h-[50px] !tw-h-[80px] rounded-lg"/>
          </v-col>
        <v-col  lg="4" class="pb-0 !tw-font-bold">
          {{data.trecho.municipio_origem.nome +" - "+ data.trecho.municipio_destino.nome}}
          <br><span class="tw-font-normal">{{ data.trecho_viagem.data_embarque }}</span>
        </v-col>
        <v-col lg="4" class="pb-0 ! !tw-font-black tw-text-lg !tw-text-primary text-end">
          {{formatCurrency(valorTotal.total)}} <br> <small v-if="valorTotal.taxa > 0" class="tw-text-[12px] tw-font-semibold">Taxa de embarque: {{formatCurrency(valorTotal.taxa)}}</small>
        </v-col>
        <v-col cols="12" class="py-0">
          <v-divider  :thickness="1" class="border-opacity-100 tw-mt-2 " ></v-divider>
        </v-col>
        <v-col cols="8"  class="tw-flex  tw-items-center tw-gap-3 ">
          <Icon icon="icon-park-outline:ticket"  width="20"/>
          <span class="tw-font-semibold">{{data.passagem_pedidos.length}} {{data.passagem_pedidos.length > 1 ? 'passagens' : 'passagem'}}</span>
        </v-col>
        <v-col cols="4"  class="tw-flex  tw-items-center justify-end tw-gap-3 ">
          <v-btn @click="onOpenRooms" variant="tonal" color="info"><Icon icon="weui:eyes-on-outlined" width="25"  class="mr-1 "/><span class="hidden-sm-and-down">Passagens</span></v-btn>
        </v-col>
      </v-row>
    </div>
    <v-expand-transition>
      <v-row v-if="openRooms">
        <v-col cols="12" class="pb-0">
          <v-divider  :thickness="1" class="border-opacity-100  my-3 "  ></v-divider>
        </v-col>
        <v-col v-for="item in data.passagem_pedidos" cols="12" class="pt-0">
          <v-card variant="tonal" color="primary" >
            <div  class="  tw-px-2 tw-py-[2px] tw-h-full  my-1 tw-flex tw-items-center tw-justify-between">
             <div class="tw-flex tw-items-center">
               <Icon v-if="item.comodo.tipo_comodidade_id == 4" icon="material-symbols:bedroom-child-outline-rounded"  width="22"/>
               <Icon v-if="item.comodo.tipo_comodidade_id == 1" icon="mdi:seat-passenger"  width="22"/>
               <img v-if="item.comodo.tipo_comodidade_id == 2" src="/assets/images/icons/baiano.svg" width="30" :alt="item.comodo.nome">
                <span class="ml-2">({{ item.comodo.tipo_comodidade.nome}}) {{item.comodo.numeracao }} -  {{item.passageiro?.nome}}</span>
             </div>
              <Icon
                  v-if="!item.deleted_at"
                  @click="setToDelete(item)"
                  icon="mdi:close-box" width="25"  class="mr-1 tw-cursor-pointer !tw-text-red-500"/>
              <span v-else >Removido</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>

</style>
