import axios from "axios"

const URL = import.meta.env.VITE_API

const instance = (token?:string) => axios.create({
    baseURL:URL,
    headers:token ? {"Authorization":`Bearer ${token}`} : {}
})

export default instance