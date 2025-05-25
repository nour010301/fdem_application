// services/auth.ts
import axios from 'axios'

export async function logout(refreshToken: string) {
  return axios.post('http://10.10.150.75:8000/api/api/logout/', {
    refresh: refreshToken,
  })
}

