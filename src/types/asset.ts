/**
 * Asset Management Types
 * Defines the data model for uploaded assets and asset library
 */

export interface Asset {
  id: string
  url: string
  publicId: string
  filename: string
  uploadedAt: number
  width: number
  height: number
  format: string
  size?: number
  tags: string[]
  folder?: string
}

export interface AssetFolder {
  id: string
  name: string
  createdAt: number
  assetCount: number
}

export type AssetSortBy = 'uploadedAt' | 'filename' | 'size'
export type AssetSortOrder = 'asc' | 'desc'

export interface AssetFilters {
  searchQuery?: string
  folder?: string
  tags?: string[]
  format?: string[]
  sortBy: AssetSortBy
  sortOrder: AssetSortOrder
}
