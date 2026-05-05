import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const figmaApi = {
  getFile: (fileKey: string) => api.get(`/figma/files/${fileKey}`),
  getNodes: (fileKey: string, ids: string) => api.get(`/figma/files/${fileKey}/nodes`, { params: { ids } }),
  getImages: (fileKey: string, ids: string, format = 'png') =>
    api.get(`/figma/files/${fileKey}/images`, { params: { ids, format } }),
  getComponents: (fileKey: string) => api.get(`/figma/files/${fileKey}/components`),
  getComments: (fileKey: string) => api.get(`/figma/files/${fileKey}/comments`),
  getTeamProjects: (teamId: string) => api.get(`/figma/teams/${teamId}/projects`),
  getProjectFiles: (projectId: string) => api.get(`/figma/projects/${projectId}/files`),
}
