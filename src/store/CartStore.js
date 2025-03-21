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
                }).catch((error) => {

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

        getTotal(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                    if(i.deleted_at){
                        return t
                    }
                    return t + (i.valor + (i.taxa_embarque ?? 0))
                },0)
            },0)
        },

        getTotalTickets(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                    if(i.deleted_at){
                        return t
                    }
                    return t + (i.valor)
                },0)
            },0)
        },

        getCountTickets(){
            return this.order?.passagens_agrupadas?.length
        },

        getTotalTaxa(){
            return this.order?.passagens_agrupadas?.reduce((total, item) => {
                return total + item.passagem_pedidos.reduce((t, i) => {
                    if(i.deleted_at){
                        return t
                    }
                    return t + ( i.taxa_embarque ?? 0)
                },0)
            },0)
        },

        removerItem(item){

            routes["order.delete"](item.pedido, item).then(response => {
                this.order.passagens_agrupadas.forEach(group => {
                    if(group.viagem.id == item.viagem_id){
                        const comodoIndex = group.passagem_pedidos.findIndex(it=>item.comodos_ids.includes(it.comodo_id))
                        if(comodoIndex >= 0){
                            group.passagem_pedidos.splice(comodoIndex,1)
                        }
                    }
                })
                this.addItem(this.order)
                if(this.getTotalTickets() === 0){
                    this.clearCartLocal()
                }
                this.loadCart();
            });


        },

        clearCartLocal() {
            this.order = null;
            localStorage.removeItem('cart');

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
