import axios from 'axios'

const API_URL = '/api/login/'

export async function login(username: string, password: string): Promise<void> {
  try {
    const response = await axios.post(API_URL, { username, password })
    const token = response.data.token
    if (!token) throw new Error('Token manquant dans la réponse')
    localStorage.setItem('jwt_token', token)
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail)
    }
    throw new Error('Erreur lors de la connexion')
  }
}

export function getToken(): string | null {
  return localStorage.getItem('jwt_token')
}

export function logout(): void {
  localStorage.removeItem('jwt_token')
}