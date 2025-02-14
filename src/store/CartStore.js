import { defineStore } from 'pinia';
import {routes} from "../services/fetch.js";
import {userAuthStore} from "./AuthStore.js";


export const useCartStore = defineStore('cart', {
    state: () => ({
        order: null,
        isCartVisible: false,
    }),
    actions: {

        async addItem(item) {
            localStorage.setItem('cart', JSON.stringify(item));
        },

        async loadCart() {
            const authStore = userAuthStore()
            if (authStore.isAuthenticated()) {
                await routes['order.open']().then((response) => {
                    this.order = response.data.data
                })
            } else {
                const localCart = localStorage.getItem('cart');
                this.order = localCart ? JSON.parse(localCart) : null;
            }
        },

        async syncCart() {
            if(this.order){
                await routes['order.sync'](this.order.id).then((response) => {
                    this.loadCart()
                }).catch((error) => {
                    console.log(error);
                })
            }
        },

        isEmptyCart() {
            return !(!!this.order);
        },
        getTotalTravelCount() {
            return this.order?.passagens_agrupadas?.length;
        },
        getTotalTicketCount() {
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.length
            },0)
        },

        clearCartLocal() {
            this.order = null;
            localStorage.removeItem('cart');
        },

        getOffers(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                   return total + (i.desconto?.desconto ?? 0)
                },0)
            },0)
        },

        getTotal(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                    return total + ((i.valor + (i.taxa_embarque ?? 0)) - (i.desconto?.desconto ?? 0))
                },0)
            },0)
        },

        getTotalTaxa(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                    return total + ( i.taxa_embarque ?? 0)
                },0)
            },0)
        },

        async clearCart() {
            this.clearCartLocal()
            const authStore = userAuthStore()
            if (authStore.user) {
                const passagens  = []
                this.order.passagens_agrupadas.forEach(p =>{
                    p.passagem_pedidos.forEach(p => {
                        passagens.push(p.comodo.id)
                    })
                })

                const params = {pedido_id:this.order.id,comodos_ids:passagens};
                await routes['order.delete'](this.order.id,params).then((response) => {

                }).catch((error) => {
                    console.log(error);
                })
            }

        },
    },
});
