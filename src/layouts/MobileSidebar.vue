<script setup >
import AppLogo from "../components/ui-components/AppLogo.vue";

</script>

<template>
    <div class="pt-6 lp-mobile-sidebar">
        <div class="ml-6 mb-3">
            <AppLogo />
        </div>
        <v-list class="py-0 px-2">
            <v-list-item rounded="md">
                <v-btn variant="text" class="custom-hover-primary px-0 text-left" flat
                    href="https://demos.wrappixel.com/premium/vue/modernize-vuejs/docs/index.html" target="_blank">
                    <h5 class="text-subtitle-1">Documentation</h5>
                </v-btn>
            </v-list-item>
            <v-list-item class="mt-2" rounded="md">
                <v-btn class="custom-hover-primary bg-primary" block flat href="/auth/login" target="_blank">Login</v-btn>
            </v-list-item>
        </v-list>
    </div>
</template>
