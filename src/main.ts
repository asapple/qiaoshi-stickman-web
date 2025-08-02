import 'vant/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Dialog, NavBar, Cell, CellGroup, Button, Tabbar, TabbarItem, Toast } from 'vant'

import App from './App.vue'
import router from './router'

// This line will cause a TypeScript error
const num: number = "this is a string";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Dialog)
app.use(NavBar)
app.use(Cell)
app.use(CellGroup)
app.use(Button)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Toast)

app.mount('#app')