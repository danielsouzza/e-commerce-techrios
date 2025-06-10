import { defineStore } from 'pinia';
import {routes} from "../services/fetch.js";
import {userAuthStore} from "./AuthStore.js";
import router from "../routes/index.js";


export const useCartStore = defineStore('cart', {
    state: () => ({
        order: null,
        isCartVisible: false,
        loading: false,
    }),
    actions: {

        async addItem(item) {
            const dataExpiracao = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 horas em milissegundos
            const dados = {
                carrinho: item,
                expiraEm: dataExpiracao
            };
            localStorage.setItem('cart', JSON.stringify(dados));
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
                if(localCart){
                    const { carrinho, expiraEm } = JSON.parse(localCart);
                    const agora = new Date().getTime();

                    if (agora > expiraEm) {
                        localStorage.removeItem("carrinho");
                        this.order =  null;
                    }
                    this.order = carrinho
                    this.order.passagens_agrupadas = this.order.passagens_agrupadas?.filter(
                        passagem => passagem.passagem_pedidos.length > 0
                    );

                }else {
                    this.order =  null;
                }
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

        async removerItem(item){

            routes["order.delete"](item.pedido, item).then(response => {
                this.order.passagens_agrupadas?.forEach(group => {
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
                    router.push({name: "home"})
                    // window.location = '/'
                }
                this.loadCart();
            });
        },

        clearCartLocal() {
            this.order = null;
            localStorage.removeItem('cart');
        },

        async clearCart() {
            this.loading = true;
            const authStore = userAuthStore()
            if (authStore.isAuthenticated()) {
                const passagens  = []
                console.log(this.order)
                this.order.passagens_agrupadas.forEach(p =>{
                    p.passagem_pedidos.forEach(p => {
                        passagens.push(p.comodo.id)
                    })
                })

                const params = {pedido_id:this.order.id,comodos_ids:passagens};
                await routes['order.delete'](this.order.id,params).then((response) => {
                    console.log(response);
                    this.clearCartLocal()
                    router.push({name: "home"})
                    this.loading = false;
                }).catch((error) => {
                    console.log(error);
                })
            }else {
                this.clearCartLocal()
                router.push({name: "home"})

                this.loading = false;
            }


        },
    },
});
