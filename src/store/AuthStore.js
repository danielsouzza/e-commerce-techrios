import {defineStore} from "pinia";
import {routes} from "../services/fetch.js";
import {useCartStore} from "./CartStore.js";
import router from "../routes/index.js";



export const userAuthStore = defineStore('userAuth', {
    state: () => ({
        user: null,
    }),

    actions: {
         isAuthenticated() {
            return !!this.getToken()
        },
        setToken(token) {
             localStorage.setItem('auth_token', token)
        },
        getToken() {
             return localStorage.getItem('auth_token')
        },
        setUser(user) {
             this.user = user
        },
        logout() {
            const cartStore = useCartStore()
            this.user = null
            localStorage.removeItem('auth_token')
            cartStore.clearCart()
        },
        async loadUser() {
             if(this.isAuthenticated()){
                 await routes['user.me']().then((res) => {
                     this.setUser(res.data.data);
                 }).catch(error=>{
                     this.logout()
                     router.push({name: "login"})
                 })
             }
        },
        async getUser() {
             if (!this.user) {
                 await this.loadUser()
             }
             return this.user;
        }
    }
})