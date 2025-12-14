/**
 * Asset Storage Layer
 * IndexedDB-based storage for asset metadata
 */

import type { Asset, AssetFolder, AssetFilters } from '@/types/asset'

const DB_NAME = 'EmailDesignerAssets'
const DB_VERSION = 1
const ASSET_STORE = 'assets'
const FOLDER_STORE = 'folders'

// IndexedDB instance
let db: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create assets store
      if (!database.objectStoreNames.contains(ASSET_STORE)) {
        const assetStore = database.createObjectStore(ASSET_STORE, { keyPath: 'id' })
        assetStore.createIndex('uploadedAt', 'uploadedAt', { unique: false })
        assetStore.createIndex('filename', 'filename', { unique: false })
        assetStore.createIndex('folder', 'folder', { unique: false })
        assetStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
      }

      // Create folders store
      if (!database.objectStoreNames.contains(FOLDER_STORE)) {
        database.createObjectStore(FOLDER_STORE, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Add asset to storage
 */
export async function addAsset(asset: Asset): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readwrite')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.add(asset)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get asset by ID
 */
export async function getAsset(id: string): Promise<Asset | undefined> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readonly')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all assets with optional filtering
 */
export async function getAssets(filters?: Partial<AssetFilters>): Promise<Asset[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readonly')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      let assets = request.result as Asset[]

      // Apply filters
      if (filters) {
        // Filter by folder
        if (filters.folder) {
          assets = assets.filter(a => a.folder === filters.folder)
        }

        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
          assets = assets.filter(a =>
            filters.tags!.some(tag => a.tags.includes(tag))
          )
        }

        // Filter by format
        if (filters.format && filters.format.length > 0) {
          assets = assets.filter(a => filters.format!.includes(a.format))
        }

        // Search by filename
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          assets = assets.filter(a =>
            a.filename.toLowerCase().includes(query) ||
            a.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }

        // Sort
        if (filters.sortBy) {
          assets.sort((a, b) => {
            const aVal = a[filters.sortBy!]
            const bVal = b[filters.sortBy!]

            let comparison = 0
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              comparison = aVal.localeCompare(bVal)
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
              comparison = aVal - bVal
            }

            return filters.sortOrder === 'desc' ? -comparison : comparison
          })
        }
      }

      resolve(assets)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete asset by ID
 */
export async function deleteAsset(id: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readwrite')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update asset
 */
export async function updateAsset(asset: Asset): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readwrite')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.put(asset)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all folders
 */
export async function getFolders(): Promise<AssetFolder[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([FOLDER_STORE], 'readonly')
    const store = transaction.objectStore(FOLDER_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Add folder
 */
export async function addFolder(folder: AssetFolder): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([FOLDER_STORE], 'readwrite')
    const store = transaction.objectStore(FOLDER_STORE)
    const request = store.add(folder)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete folder
 */
export async function deleteFolder(id: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([FOLDER_STORE], 'readwrite')
    const store = transaction.objectStore(FOLDER_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Clear all assets (useful for testing)
 */
export async function clearAssets(): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSET_STORE], 'readwrite')
    const store = transaction.objectStore(ASSET_STORE)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get asset count
 */
export async function getAssetCount(folder?: string): Promise<number> {
  const assets = await getAssets(folder ? { folder } : undefined)
  return assets.length
}
