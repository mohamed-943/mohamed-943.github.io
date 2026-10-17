/** Préfixe un chemin de /public avec la base de déploiement (GitHub Pages en sous-dossier, etc.). */
export const asset = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`
