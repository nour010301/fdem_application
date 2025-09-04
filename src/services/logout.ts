// services/auth.ts

import axiosInstance from '../axios.ts'

export async function logout(refreshToken: string) {
  return axiosInstance.post('api/logout/', {
    refresh: refreshToken,
  })
}

