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


        clearCart() {
            this.order = {};
            localStorage.removeItem('cart');
        },
    },
});
