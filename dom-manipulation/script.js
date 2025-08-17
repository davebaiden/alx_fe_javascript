// Initial quotes array
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categorySelect = document.getElementById("categorySelect");

// --- Utility function to update categories dropdown dynamically
function updateCategoryDropdown() {
  // Clear existing options
  categorySelect.innerHTML = "";

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Add "All" option
  let allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  // Add category options
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// --- Show a random quote (filtered by category if selected)
function showRandomQuote() {
  let selectedCategory = categorySelect.value;

  let filteredQuotes = selectedCategory === "All" || !selectedCategory
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - (${filteredQuotes[randomIndex].category})`;
}

// --- Add new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote object
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Update category dropdown dynamically
  updateCategoryDropdown();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// --- Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categorySelect.addEventListener("change", showRandomQuote);

// --- Initialize on load
updateCategoryDropdown();
showRandomQuote();
