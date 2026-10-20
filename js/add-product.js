const API = "https://shopsphere-backend-wr5o.onrender.com/products";
const CATEGORY_API = "https://shopsphere-backend-wr5o.onrender.com/categories";
const form = document.getElementById("form");
const productsDiv = document.getElementById("products");
const countSpan = document.getElementById("count");
const categoryFilter = document.getElementById("categoryFilter");
const categoryList = document.getElementById("categoryList");
const newCategoryInput = document.getElementById("newCategory");
const createCategoryBtn = document.getElementById("createCategoryBtn");
const rawPriceInput = document.getElementById("rawPrice");
const productPriceInput = document.getElementById("productPrice");

let activeProductId = null;
let allProducts = [];
let categories = [];

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function categoryNames() {
    return [...new Set(categories.map((category) => category.name?.trim().replace(/\s+/g, " ")).filter(Boolean))];
}

function renderCategoryControls() {
    const currentFilter = categoryFilter?.value || "";
    if (categoryFilter) {
        categoryFilter.innerHTML = `<option value="">All categories</option>${categoryNames()
            .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
            .join("")}`;
        categoryFilter.value = categoryNames().includes(currentFilter) ? currentFilter : "";
    }

    if (categoryList) {
        categoryList.innerHTML = categories.length
            ? categories.map((category) => `
                <span class="category-chip">
                    ${escapeHtml(category.name)} <small>${category.productCount || 0}</small>
                    <button type="button" data-delete-category="${escapeHtml(category.name)}" aria-label="Delete ${escapeHtml(category.name)}">×</button>
                </span>
            `).join("")
            : '<span class="empty-state">No categories yet. Create one above.</span>';

        categoryList.querySelectorAll("[data-delete-category]").forEach((button) => {
            button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory));
        });
    }
}

function categoryOptions(selected) {
    const names = categoryNames();
    if (selected && !names.includes(selected)) names.unshift(selected);
    return names.map((name) => `<option value="${escapeHtml(name)}" ${name === selected ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
}

function renderProducts() {
    if (!productsDiv) return;
    const selectedCategory = categoryFilter?.value || "";
    const products = selectedCategory
        ? allProducts.filter((product) => product.category === selectedCategory)
        : allProducts;

    if (countSpan) countSpan.innerText = products.length;
    productsDiv.innerHTML = products.length ? products.map((product) => `
        <div class="card">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name || "Product")}" />
            <h3>${escapeHtml(product.name)}</h3>
            <p class="price">KES ${Number(product.price).toLocaleString()}</p>
            <label class="category-label" for="category-${escapeHtml(product._id)}">Category</label>
            <select id="category-${escapeHtml(product._id)}" data-product-category="${escapeHtml(product._id)}">
                ${categoryOptions(product.category)}
            </select>
            <div class="card-controls">
                <button class="info-btn" type="button" data-edit-specs="${escapeHtml(product._id)}">Add/Edit Details</button>
                <button class="delete-btn" type="button" data-delete-product="${escapeHtml(product._id)}">Remove Product</button>
            </div>
        </div>
    `).join("") : '<p class="empty-state">No products match this category.</p>';

    productsDiv.querySelectorAll("[data-product-category]").forEach((select) => {
        select.addEventListener("change", () => moveProductCategory(select.dataset.productCategory, select.value));
    });
    productsDiv.querySelectorAll("[data-edit-specs]").forEach((button) => {
        button.addEventListener("click", () => {
            const product = allProducts.find((item) => item._id === button.dataset.editSpecs);
            if (product) window.openSpecModal(product._id, product.name, product.description || "");
        });
    });
    productsDiv.querySelectorAll("[data-delete-product]").forEach((button) => {
        button.addEventListener("click", () => deleteProduct(button.dataset.deleteProduct));
    });
}

async function loadCategories() {
    try {
        const response = await fetch(CATEGORY_API);
        if (!response.ok) throw new Error("Category API unavailable");
        categories = await response.json();
    } catch (error) {
        const names = [...new Set(allProducts.map((product) => product.category?.trim().replace(/\s+/g, " ")).filter(Boolean))];
        categories = names.map((name) => ({ name, productCount: allProducts.filter((product) => product.category === name).length }));
        console.warn("Using product categories until the category API is available.", error);
    }
    renderCategoryControls();
    renderProducts();
}

async function loadProducts() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error(`Products request failed: ${response.status}`);
        allProducts = await response.json();
        await loadCategories();
    } catch (error) {
        console.error("Error populating system inventory cards:", error);
        if (productsDiv) productsDiv.innerHTML = '<p class="empty-state">Unable to load inventory right now.</p>';
    }
}

if (categoryFilter) categoryFilter.addEventListener("change", renderProducts);

if (createCategoryBtn) {
    createCategoryBtn.addEventListener("click", async () => {
        const name = newCategoryInput?.value.trim();
        if (!name) return alert("Enter a category name first.");
        createCategoryBtn.disabled = true;
        try {
            const response = await fetch(CATEGORY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to create category");
            newCategoryInput.value = "";
            await loadCategories();
        } catch (error) {
            alert(error.message);
        } finally {
            createCategoryBtn.disabled = false;
        }
    });
}

async function deleteCategory(name) {
    const category = categories.find((item) => item.name === name);
    const occupied = category?.productCount > 0;
    const replacement = occupied
        ? prompt(`Move ${category.productCount} product(s) from "${name}" to which category?`, categoryNames().find((item) => item !== name) || "")
        : "";
    if (occupied && !replacement) return;
    if (!confirm(`Delete the category "${name}"?`)) return;

    try {
        const response = await fetch(`${CATEGORY_API}/${encodeURIComponent(name)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ replacement: replacement || undefined })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to delete category");
        await loadProducts();
    } catch (error) {
        alert(error.message);
    }
}

async function moveProductCategory(id, category) {
    try {
        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to move product");
        if (data.product?.category !== category) throw new Error("The deployed backend does not support category updates yet.");
        await loadProducts();
    } catch (error) {
        alert(error.message);
        renderProducts();
    }
}

if (rawPriceInput && productPriceInput) {
    rawPriceInput.addEventListener("input", () => {
        const raw = rawPriceInput.value.trim();
        productPriceInput.value = raw ? Math.round(parseFloat(raw) * 1.3) : "";
    });
}

if (form) {
    form.onsubmit = async (event) => {
        event.preventDefault();
        const button = event.target.querySelector("button");
        button.innerText = "Processing...";
        button.disabled = true;
        try {
            const response = await fetch(API, { method: "POST", body: new FormData(form) });
            if (!response.ok) throw new Error("Upload failed");
            form.reset();
            await loadProducts();
        } catch (error) {
            alert(error.message);
        } finally {
            button.innerText = "Publish to Store";
            button.disabled = false;
        }
    };
}

window.openSpecModal = function (id, name, currentDesc) {
    activeProductId = id;
    document.getElementById("modalTitle").innerText = `Edit Specs: ${name}`;
    document.getElementById("specTextTextarea").value = currentDesc;
    document.getElementById("specModal").classList.add("active");
};

window.closeSpecModal = function () {
    document.getElementById("specModal").classList.remove("active");
    document.getElementById("specTextTextarea").value = "";
    activeProductId = null;
};

window.handleSaveInformation = async function () {
    if (!activeProductId) return alert("No product selected.");
    const saveButton = document.getElementById("modalSaveBtn");
    saveButton.innerText = "Saving Data...";
    saveButton.disabled = true;
    try {
        const response = await fetch(`${API}/${activeProductId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: document.getElementById("specTextTextarea").value })
        });
        if (!response.ok) throw new Error("Failed to save product details");
        window.closeSpecModal();
        await loadProducts();
    } catch (error) {
        alert(error.message);
    } finally {
        saveButton.innerText = "Save Information";
        saveButton.disabled = false;
    }
};

async function deleteProduct(id) {
    if (!confirm("Are you sure? This will remove the product from the public site immediately.")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    await loadProducts();
}

loadProducts();
