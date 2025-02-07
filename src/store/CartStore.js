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
            if (authStore.user) {
                await routes['order.open']().then((response) => {
                    this.order = response.data.data
                }).catch((error) => {
                    console.log(error);
                })
            } else {
                const localCart = localStorage.getItem('cart');
                this.order = localCart ? JSON.parse(localCart) : null;
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


        async clearCart() {
            const authStore = userAuthStore()
            if (authStore.user) {
                const passagens  = []
                this.order.passagens_agrupadas.forEach(p =>{
                    p.passagem_pedidos.forEach(p => {
                        passagens.push(p.comodo.id)
                    })
                })
                console.log(passagens)
                const params = {pedido_id:this.order.id,comodos_ids:passagens};
                await routes['order.delete'](this.order.id,params).then((response) => {
                    console.log(response)
                }).catch((error) => {
                    console.log(error);
                })
            }

            this.order = null;
            localStorage.removeItem('cart');
        },
    },
});
