import axios from "axios"

const URL = import.meta.env.VITE_API

const instance = (token?: string) => {
  const api = axios.create({
    baseURL: URL,
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        // Token muddati tugagan / yaroqsiz — foydalanuvchini avtomatik chiqarib yuborish
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
      return Promise.reject(error)
    }
  )

  return api
}

export default instance