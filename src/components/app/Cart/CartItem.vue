<script setup>

import {formatCurrency} from "../../../Helper/Ultis.js";
import {computed, ref} from "vue";
import {Icon} from "@iconify/vue";
import {useCartStore} from "../../../store/CartStore.js";
import TravelImages from "../../shared/TravelImages.vue";
import {VIcon} from "vuetify/components";

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
  return valor + taxa;
})

function setToDelete(item){
  comodoToDelete.value = item
  showDialogDelete.value = true
}


function confirmDelete(){
  loadingDelete.value = true
  useCartStore().removerItem({pedido:comodoToDelete.value.pedido_id,comodos_ids:[comodoToDelete.value.comodo.id],viagem_id:props.data.viagem.id})
  loadingDelete.value = false
  showDialogDelete.value = false
  comodoToDelete.value = null
}


function onOpenRooms(){
  openRooms.value = !openRooms.value
}


</script>

<template>
  <v-dialog max-width="600" v-model="showDialogDelete">
    <template v-slot:default="{ isActive }">
      <v-card title="Excluir comodo">
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
  <v-card variant="outlined" rounded="lg" class="!tw-p-4 !tw-border-secondary">
    <div class="tw-flex  mt-3 tw-w-full ">

      <div class="tw-mr-5">
        <TravelImages :alt="data.trecho.municipio_destino?.nome" :images="data.trecho.municipio_destino?.images?? []" class="bg-grey-lighten-2 !tw-w-[120px] !tw-h-[50px]"/>
      </div>
      <v-row>
        <v-col cols="6" class="pb-0 !tw-font-bold">
          {{data.trecho.municipio_origem.nome +" - "+ data.trecho.municipio_destino.nome}}
          <br><span class="tw-font-normal">{{ data.viagem.saida }}</span>
        </v-col>
        <v-col cols="6" class="pb-0 ! !tw-font-black tw-text-lg !tw-text-primary text-end">
          {{formatCurrency(valorTotal)}}
        </v-col>
        <v-col cols="12" class="py-0">
          <v-divider  :thickness="1" class="border-opacity-100 tw-mt-2 " ></v-divider>
        </v-col>
        <v-col  class="tw-flex  tw-items-center tw-gap-3 ">
          <Icon icon="icon-park-outline:ticket"  width="20"/>
          <span class="tw-font-semibold">{{data.passagem_pedidos.length}} {{data.passagem_pedidos.length > 1 ? 'passagens' : 'passagem'}}</span>
        </v-col>
        <v-col  class="tw-flex  tw-items-center justify-end tw-gap-3 ">
          <v-btn @click="onOpenRooms" variant="tonal" color="info"><Icon icon="weui:eyes-on-outlined" width="25"  class="mr-1 "/>Cômodos</v-btn>
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