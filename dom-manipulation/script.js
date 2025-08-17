let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
  { text: "Do not pray for an easy life, pray for the strength to endure a difficult one.", author: "Bruce Lee", category: "Motivation" }
];

let filteredQuotes = [...quotes];

// ---------------- DISPLAY QUOTES ----------------
function newQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p>- ${quote.author} (${quote.category})</p>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// ---------------- ADD QUOTE ----------------
function addQuote() {
  const text = document.getElementById("quoteInput").value.trim();
  const author = document.getElementById("authorInput").value.trim();
  const category = document.getElementById("categoryInput").value.trim();

  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    filterQuotes();
    document.getElementById("quoteInput").value = "";
    document.getElementById("authorInput").value = "";
    document.getElementById("categoryInput").value = "";
  } else {
    alert("Please fill all fields before adding a quote.");
  }
}

// ---------------- FILTER QUOTES ----------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedCategory;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  filteredQuotes = selectedCategory === "all"
    ? [...quotes]
    : quotes.filter(q => q.category === selectedCategory);

  newQuote();
}

// ---------------- EXPORT & IMPORT ----------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = [...quotes, ...importedQuotes];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
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

// ---------------- SERVER SYNC (SIMULATION) ----------------
async function syncWithServer() {
  const statusBox = document.getElementById("syncStatus");
  statusBox.innerText = "Syncing with server...";

  try {
    // Simulate fetching from server
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Convert serverData to quotes format (simulate categories too)
    const serverQuotes = serverData.slice(0, 5).map((item, index) => ({
      text: item.title,
      author: `Server Author ${index + 1}`,
      category: index % 2 === 0 ? "Server" : "General"
    }));

    // Conflict resolution: Server takes precedence
    const serverTexts = new Set(serverQuotes.map(q => q.text));
    quotes = [
      ...serverQuotes,
      ...quotes.filter(q => !serverTexts.has(q.text))
    ];

    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    filterQuotes();

    statusBox.innerText = "Sync completed successfully!";
  } catch (error) {
    statusBox.innerText = "Error syncing with server.";
    console.error(error);
  }
}

// ---------------- INIT ----------------
window.onload = () => {
  populateCategories();
  filterQuotes();

  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    document.getElementById("quoteDisplay").innerHTML =
      `<p>"${quote.text}"</p><p>- ${quote.author} (${quote.category})</p>`;
  }

  // Periodic sync every 60 seconds
  setInterval(syncWithServer, 60000);
};
