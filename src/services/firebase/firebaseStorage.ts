/**
 * 📁 SERVICE DE FIREBASE STORAGE
 *
 * Este arquivo centraliza todas as operações de armazenamento de arquivos no Firebase Storage.
 *
 * Funcionalidades principais:
 * - Upload de imagens e arquivos genéricos
 * - Upload com monitoramento de progresso
 * - Validação de tipo e tamanho de arquivo
 * - Geração de nomes únicos para evitar conflitos
 * - Exclusão de arquivos
 * - Utilitários para manipulação de URLs
 *
 * Recursos implementados:
 * - Type safety completo
 * - Tratamento robusto de erros
 * - Validações de segurança
 * - Organização por pastas
 * - Compatibilidade com diferentes tipos de arquivo
 */

import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

import firebaseApp from '@/config/firebase/firebase'

// ====================================================================
// 🔧 CONFIGURAÇÃO E INSTÂNCIAS
// ====================================================================

/**
 * Instância do Firebase Storage
 * Conectada à configuração principal do Firebase
 */
export const storage = getStorage(firebaseApp)

// ====================================================================
// 📋 INTERFACES DE TIPOS
// ====================================================================

/**
 * Resultado de operações de upload
 * Padroniza retornos de upload com URL ou erro
 */
interface UploadResult {
  url: string | null // URL de download do arquivo ou null se falhou
  error: string | null // Mensagem de erro ou null se sucesso
}

/**
 * Resultado de operações de exclusão
 * Simples indicação de sucesso/erro
 */
interface DeleteResult {
  error: string | null // Mensagem de erro ou null se sucesso
}

/**
 * Informações de progresso durante upload
 * Usado para exibir barras de progresso em tempo real
 */
interface UploadProgress {
  progress: number // Percentual de 0 a 100
  snapshot: UploadTaskSnapshot // Snapshot completo do Firebase
}

// ====================================================================
// 🛠️ FUNÇÕES UTILITÁRIAS
// ====================================================================

/**
 * 🏷️ Gera nome único para arquivo
 *
 * Evita conflitos de nomes usando:
 * - Timestamp atual para ordenação temporal
 * - UUID v4 para garantir unicidade
 * - Extensão original do arquivo
 *
 * @param file - Arquivo original
 * @returns Nome único no formato: timestamp_uuid.extensao
 *
 * Exemplo: 1704067200000_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
 */
const generateUniqueFileName = (file: File): string => {
  const timestamp = Date.now()
  const uuid = uuidv4()
  const extension = file.name.split('.').pop()
  return `${timestamp}_${uuid}.${extension}`
}

/**
 * 🖼️ Valida se arquivo é uma imagem permitida
 *
 * TIPOS ACEITOS:
 * - JPEG/JPG - Compatibilidade universal
 * - PNG - Transparência e qualidade
 * - WEBP - Formato moderno e eficiente
 * - GIF - Imagens animadas
 *
 * @param file - Arquivo a ser validado
 * @returns true se é imagem válida, false caso contrário
 */
const validateImageFile = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ]
  return allowedTypes.includes(file.type)
}

/**
 * 📏 Valida tamanho do arquivo
 *
 * LIMITE: 10MB (configurável)
 *
 * Considerações:
 * - Limite do Firebase: 32GB (muito alto para web)
 * - UX: 10MB é razoável para imagens/documentos
 * - Performance: Uploads menores são mais rápidos
 *
 * @param file - Arquivo a ser validado
 * @returns true se tamanho é aceitável, false caso contrário
 */
const validateFile = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024 // 10MB em bytes
  return file.size <= maxSize
}

// ====================================================================
// 📤 FUNÇÕES DE UPLOAD
// ====================================================================

/**
 * 🖼️ Upload de imagem com validações específicas
 *
 * VALIDAÇÕES APLICADAS:
 * - Tipo de arquivo (apenas imagens)
 * - Tamanho máximo (10MB)
 * - Nome único gerado automaticamente
 *
 * ORGANIZAÇÃO:
 * - Pasta padrão: 'images'
 * - Estrutura: images/timestamp_uuid.extensao
 *
 * @param file - Arquivo de imagem a ser enviado
 * @param folder - Pasta de destino (padrão: 'images')
 * @returns Promise com URL de download ou erro
 *
 * EXEMPLO DE USO:
 * ```typescript
 * const { url, error } = await uploadImage(imageFile, 'avatars')
 * if (url) {
 *   setProfileImage(url)
 * } else {
 *   toast.error(error)
 * }
 * ```
 */
export const uploadImage = async (
  file: File,
  folder: string = 'images',
): Promise<UploadResult> => {
  try {
    // 🔍 Validação de tipo de arquivo
    if (!validateImageFile(file)) {
      return {
        url: null,
        error: 'Tipo de arquivo não permitido. Use: JPG, PNG, WEBP ou GIF',
      }
    }

    // 📏 Validação de tamanho
    if (!validateFile(file)) {
      return {
        url: null,
        error: 'Arquivo muito grande. Máximo 10MB',
      }
    }

    // 🏷️ Gerar nome único e criar referência
    const uniqueFileName = generateUniqueFileName(file)
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`)

    // 📤 Upload do arquivo
    const snapshot = await uploadBytes(storageRef, file)

    // 🔗 Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      url: downloadURL,
      error: null,
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload',
    }
  }
}

/**
 * 📄 Upload de arquivo genérico
 *
 * DIFERENÇAS do uploadImage:
 * - Não valida tipo específico (aceita qualquer arquivo)
 * - Pasta padrão: 'files'
 * - Mesmas validações de tamanho
 *
 * CASOS DE USO:
 * - Documentos (PDF, DOC, etc.)
 * - Planilhas (XLS, CSV)
 * - Arquivos de código
 * - Qualquer tipo de arquivo
 *
 * @param file - Arquivo a ser enviado
 * @param folder - Pasta de destino (padrão: 'files')
 * @returns Promise com URL de download ou erro
 */
export const uploadFile = async (
  file: File,
  folder: string = 'files',
): Promise<UploadResult> => {
  try {
    // 📏 Apenas validação de tamanho (tipo livre)
    if (!validateFile(file)) {
      return {
        url: null,
        error: 'Arquivo muito grande. Máximo 10MB',
      }
    }

    const uniqueFileName = generateUniqueFileName(file)
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      url: downloadURL,
      error: null,
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error)
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload',
    }
  }
}

/**
 * 📊 Upload de imagem com monitoramento de progresso
 *
 * RECURSOS ESPECIAIS:
 * - Callback de progresso em tempo real
 * - Percentual preciso de upload
 * - Cancelamento possível via UploadTask
 * - Ideal para arquivos grandes
 *
 * CASOS DE USO:
 * - Upload com barra de progresso
 * - Feedback visual para usuário
 * - Uploads longos que precisam de acompanhamento
 *
 * @param file - Arquivo de imagem
 * @param folder - Pasta de destino
 * @param onProgress - Callback chamado durante o progresso
 * @returns Promise com resultado do upload
 *
 * EXEMPLO DE USO:
 * ```typescript
 * const [uploadProgress, setUploadProgress] = useState(0)
 *
 * const handleUpload = async (file: File) => {
 *   const { url, error } = await uploadImageWithProgress(
 *     file,
 *     'gallery',
 *     ({ progress }) => setUploadProgress(progress)
 *   )
 * }
 * ```
 */
export const uploadImageWithProgress = (
  file: File,
  folder: string = 'images',
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> => {
  return new Promise((resolve) => {
    try {
      // 🔍 Validações iniciais
      if (!validateImageFile(file)) {
        resolve({
          url: null,
          error: 'Tipo de arquivo não permitido. Use: JPG, PNG, WEBP ou GIF',
        })
        return
      }

      if (!validateFile(file)) {
        resolve({
          url: null,
          error: 'Arquivo muito grande. Máximo 10MB',
        })
        return
      }

      // 🚀 Iniciar upload com progresso
      const uniqueFileName = generateUniqueFileName(file)
      const storageRef = ref(storage, `${folder}/${uniqueFileName}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      // 📊 Monitorar progresso
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // 📈 Calcular e reportar progresso
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.({ progress, snapshot })
        },
        (error) => {
          // 🚨 Tratar erro durante upload
          console.error('Erro no upload:', error)
          resolve({
            url: null,
            error: error.message,
          })
        },
        async () => {
          // ✅ Upload concluído com sucesso
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              url: downloadURL,
              error: null,
            })
          } catch (error) {
            resolve({
              url: null,
              error:
                error instanceof Error ? error.message : 'Erro ao obter URL',
            })
          }
        },
      )
    } catch (error) {
      resolve({
        url: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  })
}

// ====================================================================
// 🗑️ FUNÇÕES DE EXCLUSÃO
// ====================================================================

/**
 * 🗑️ Deleta arquivo do Firebase Storage
 *
 * IMPORTANTE:
 * - Aceita URL completa ou path do storage
 * - Operação irreversível
 * - Não afeta referências no Firestore
 * - Falha silenciosa se arquivo não existir
 *
 * @param url - URL completa ou path do arquivo
 * @returns Promise com resultado da operação
 *
 * FLUXO RECOMENDADO:
 * ```typescript
 * // 1. Remover referência do Firestore
 * await updateDoc(docRef, { imageUrl: null })
 *
 * // 2. Deletar arquivo físico
 * const { error } = await deleteFile(imageUrl)
 * if (error) {
 *   // Reverter mudança no Firestore se necessário
 * }
 * ```
 */
export const deleteFile = async (url: string): Promise<DeleteResult> => {
  if (!url) {
    return {
      error: 'URL do arquivo não fornecida',
    }
  }

  try {
    // 🔗 Criar referência usando URL
    const fileRef = ref(storage, url)

    // 🗑️ Deletar arquivo
    await deleteObject(fileRef)

    return {
      error: null,
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return {
      error: error instanceof Error ? error.message : 'Erro ao deletar arquivo',
    }
  }
}

/**
 * 🖼️ Alias para deleteFile (compatibilidade)
 *
 * Mantido para retrocompatibilidade com código existente
 * que usa deleteImage especificamente para imagens
 */
export const deleteImage = deleteFile

// ====================================================================
// 🔧 FUNÇÕES UTILITÁRIAS
// ====================================================================

/**
 * 🔗 Extrai o path do storage a partir da URL de download
 *
 * CASOS DE USO:
 * - Debugging e logs
 * - Operações que precisam do path original
 * - Análise de estrutura de pastas
 *
 * @param url - URL completa de download do Firebase
 * @returns Path do arquivo no storage ou null se inválido
 *
 * EXEMPLO:
 * Input: "https://firebasestorage.googleapis.com/.../o/images%2Ffile.jpg?alt=media"
 * Output: "images/file.jpg"
 */
export const getStoragePathFromURL = (url: string): string | null => {
  try {
    // 🔍 Quebrar URL nas partes relevantes
    const urlParts = url.split('/o/')
    if (urlParts.length < 2) return null

    // 🎯 Extrair e decodificar path
    const pathPart = urlParts[1].split('?')[0]
    return decodeURIComponent(pathPart)
  } catch (error) {
    console.error('Erro ao extrair path da URL:', error)
    return null
  }
}
