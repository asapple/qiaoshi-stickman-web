import 'vant/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Dialog, NavBar, Cell, CellGroup, Button, Tabbar, TabbarItem } from 'vant'

import App from './App.vue'
import router from './router'

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

app.mount('#app')