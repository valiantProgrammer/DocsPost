import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

// Query helpers
export async function getDocuments() {
  const query = `*[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    estimatedReadTime,
    publishedAt,
    featured,
    category->{
      _id,
      title,
      slug,
      icon,
      color,
    },
    author->{
      _id,
      name,
      image,
    },
  }`
  return await client.fetch(query)
}

export async function getDocumentBySlug(slug) {
  const query = `*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    content,
    tags,
    difficulty,
    estimatedReadTime,
    publishedAt,
    updatedAt,
    category->{
      _id,
      title,
      slug,
      icon,
    },
    author->{
      _id,
      name,
      image,
      bio,
      socialLinks,
    },
  }`
  return await client.fetch(query, { slug })
}

export async function getCategories() {
  const query = `*[_type == "category"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    icon,
    color,
  }`
  return await client.fetch(query)
}

export async function getDocumentsByCategory(categorySlug) {
  const query = `*[_type == "article" && category->slug.current == $slug] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    estimatedReadTime,
    publishedAt,
    category->{
      _id,
      title,
      slug,
    },
    author->{
      _id,
      name,
    },
  }`
  return await client.fetch(query, { slug: categorySlug })
}

export async function getFeaturedDocuments() {
  const query = `*[_type == "article" && featured == true] | order(publishedAt desc)[0...6] {
    _id,
    title,
    slug,
    description,
    difficulty,
    estimatedReadTime,
    publishedAt,
    category->{
      title,
      icon,
    },
  }`
  return await client.fetch(query)
}

export async function searchDocuments(searchTerm) {
  const query = `*[_type == "article" && (title match $search || description match $search || tags[] match $search)] {
    _id,
    title,
    slug,
    description,
    category->{
      title,
    },
  }`
  return await client.fetch(query, { search: `*${searchTerm}*` })
}
