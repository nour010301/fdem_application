import axiosInstance from '../axios'



export const logUserAction = async (idDocument: number, action: string): Promise<void> => {
  try {
    await axiosInstance.post('log/', {
      idDocument,
      action
    })
  } catch (error) {
    console.error('Failed to log user action:', error)
  }
}

export const LOG_ACTIONS = {
  CONSULT_FILE: 'Consult_FILE',
  DOWNLOAD: 'Telecharger',
  DELETE: 'Supprimer',
  PRINT: 'Imprimer'
} as const