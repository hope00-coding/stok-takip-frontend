import { fetchJson } from "./client.js";

export function listProducts(query = "", category = "Hepsi", onlyLow = false) {
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  if (category !== "Hepsi") params.append("category", category);
  if (onlyLow) params.append("lowStock", "true");
  return fetchJson(`/products?${params.toString()}`);
}

export function createProduct(product) {
  return fetchJson("/products", {
    method: "POST",
    body: product,
  });
}

export function patchProductStock(productId, payload) {
  return fetchJson(`/products/${encodeURIComponent(productId)}/stock`, {
    method: "PATCH",
    body: payload,
  });
}

export function getProduct(productId) {
  return fetchJson(`/products/${encodeURIComponent(productId)}`);
}

export function updateProduct(productId, product) {
  return fetchJson(`/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: product,
  });
}

export function deleteProduct(productId) {
  return fetchJson(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}
