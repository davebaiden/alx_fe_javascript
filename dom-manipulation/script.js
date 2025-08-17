// ============================
// Dynamic Quote Generator
// ============================

// ---------------- INITIAL QUOTES ----------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" }
];

let filteredQuotes = [...quotes];

// ---------------- DOM ELEMENTS ----------------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categoryFilter");

// ---------------- CATEGORY MANAGEMENT ----------------
function populateCategories() {
  categorySelect.innerHTML = "";

  const categories = [...new Set(quotes.map(q => q.category))];

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categorySelect.value = savedCategory;
}

// ---------------- DISPLAY RANDOM QUOTE ----------------
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// ---------------- ADD QUOTE ----------------
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();

  populateCategories();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// ---------------- CREATE ADD QUOTE FORM ----------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.style.marginTop = "20px";

  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.style.marginLeft = "10px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.style.marginLeft = "10px";
  addBtn.addEventListener("click", addQuote);

  formContainer.appendChild(inputQuote);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

// ---------------- LOCAL STORAGE ----------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------- JSON IMPORT/EXPORT ----------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = [...quotes, ...importedQuotes];
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
}

// ---------------- SERVER SYNC ----------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 5).map((item, index) => ({
      text: item.title,
      author: `Server Author ${index + 1}`,
      category: index % 2 === 0 ? "Server" : "General"
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function postQuotesToServer(localQuotes) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(localQuotes),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    });
    console.log("Local quotes posted to server (simulated).");
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

async function syncQuotes() {
  const statusBox = document.getElementById("syncStatus");
  if (statusBox) statusBox.innerText = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();
  const serverTexts = new Set(serverQuotes.map(q => q.text));
  const localOnlyQuotes = quotes.filter(q => !serverTexts.has(q.text));
  const conflictCount = quotes.length - localOnlyQuotes.length;

  quotes = [...serverQuotes, ...localOnlyQuotes];
  saveQuotes();

  populateCategories();
  showRandomQuote();

  await postQuotesToServer(quotes);

  if (statusBox) {
    let message = `Quotes synced with server! ${serverQuotes.length} new quotes fetched.`;
    if (conflictCount > 0) message += ` ${conflictCount} conflicts resolved.`;
    statusBox.innerText = message;
  }
}

// ---------------- EVENT LISTENERS ----------------
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// ---------------- INITIALIZATION ----------------
window.onload = () => {
  populateCategories();
  createAddQuoteForm();

  // Show last viewed quote if exists
  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
  } else {
    showRandomQuote();
  }

  // Periodic sync every 60 seconds
  setInterval(syncQuotes, 60000);
};
