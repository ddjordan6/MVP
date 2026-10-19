


document.addEventListener("DOMContentLoaded", () => {
  loadWeather();
  setupEventsPage();
  setupMapSearch();
});


async function loadWeather() {
  const status = document.querySelector("#weather-status");
  const result = document.querySelector("#weather-result");

 
  if (!status || !result) return;

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=34.3168&longitude=-84.5538" +
    "&current=temperature_2m,apparent_temperature,weather_code" +
    "&temperature_unit=fahrenheit";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const current = data.current;

    status.textContent = "Current weather near campus";
    result.textContent =
      `${Math.round(current.temperature_2m)}°F · ` +
      `Feels like ${Math.round(current.apparent_temperature)}°F · ` +
      weatherDescription(current.weather_code);
  } catch (error) {
    status.textContent = "Weather is temporarily unavailable.";
    result.textContent = "Please check again later.";
    console.error("Weather API error:", error);
  }
}


function weatherDescription(code) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Conditions updated";
}


const campusEvents = [
  {
    id: 1,
    title: "Student Open Mic",
    category: "social",
    date: "Friday · 6:30 PM",
    location: "Student Center",
    description: "Share music, poetry, comedy, or cheer on other students."
  },
  {
    id: 2,
    title: "Study Group Meetup",
    category: "academic",
    date: "Monday · 4:00 PM",
    location: "Campus Library",
    description: "Bring your notes and work with other students before the next exam."
  },
  {
    id: 3,
    title: "Campus Game Night",
    category: "social",
    date: "Wednesday · 7:00 PM",
    location: "Student Lounge",
    description: "Take a break from classes with board games and friendly competition."
  },
  {
    id: 4,
    title: "Intramural Sports",
    category: "sports",
    date: "Saturday · 2:00 PM",
    location: "Recreation Field",
    description: "Get active, meet classmates, and enjoy some friendly competition."
  },
  {
    id: 5,
    title: "Resume Workshop",
    category: "academic",
    date: "Tuesday · 3:30 PM",
    location: "Career Services",
    description: "Get tips for improving your resume and preparing for internships."
  },
  {
    id: 6,
    title: "Campus Welcome Meetup",
    category: "social",
    date: "Thursday · 5:00 PM",
    location: "Main Quad",
    description: "Meet new people and learn about student clubs and activities."
  }
];


function setupEventsPage() {
  const list = document.querySelector("#events-list");
  const search = document.querySelector("#event-search");
  const category = document.querySelector("#event-category");

  
  if (!list || !search || !category) return;

  const savedEvents = new Set();

  function renderEvents() {
    const query = search.value.trim().toLowerCase();
    const selectedCategory = category.value;

   
    const filtered = campusEvents.filter(event => {
      const searchableText =
        `${event.title} ${event.description} ` +
        `${event.location} ${event.category}`;

      const matchesQuery = searchableText.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" ||
        event.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });

   
    list.innerHTML = filtered.map(event => `
      <div class="col-md-6 col-lg-4">
        <article class="event-card">
          <span class="category-pill">${event.category}</span>
          <h2 class="h4 mt-3">${escapeHTML(event.title)}</h2>
          <div class="event-meta mb-2">
            ${escapeHTML(event.date)} · ${escapeHTML(event.location)}
          </div>
          <p>${escapeHTML(event.description)}</p>
          <button
            class="btn ${savedEvents.has(event.id) ? "btn-success" : "btn-outline-primary"} save-event"
            type="button"
            data-event-id="${event.id}"
            aria-pressed="${savedEvents.has(event.id)}">
            ${savedEvents.has(event.id) ? "Saved ✓" : "Save event"}
          </button>
        </article>
      </div>
    `).join("");

    const count = document.querySelector("#event-count");
    const empty = document.querySelector("#no-events");

    if (count) {
      count.textContent =
        `Showing ${filtered.length} of ${campusEvents.length} sample events`;
    }

    if (empty) {
      empty.classList.toggle("d-none", filtered.length !== 0);
    }
  }


  list.addEventListener("click", event => {
    const button = event.target.closest("[data-event-id]");
    if (!button) return;

    const id = Number(button.dataset.eventId);

    if (savedEvents.has(id)) {
      savedEvents.delete(id);
    } else {
      savedEvents.add(id);
    }

    renderEvents();
  });

  search.addEventListener("input", renderEvents);
  category.addEventListener("change", renderEvents);

  renderEvents();
}

function setupMapSearch() {
  const form = document.querySelector("#place-form");
  const input = document.querySelector("#place-search");
  const map = document.querySelector("#campus-map");
  const status = document.querySelector("#map-status");

]  if (!form || !input || !map || !status) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const place = input.value.trim();

    if (!place) {
      status.textContent = "Enter a place or address to search.";
      return;
    }

    status.textContent = "Searching for the location...";

    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?format=jsonv2&limit=1&q=${encodeURIComponent(place)}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Map search failed");
      }

      const results = await response.json();

      if (!results.length) {
        status.textContent =
          "No matching location was found. Try a more specific search.";
        return;
      }

      const location = results[0];
      const lat = Number(location.lat);
      const lon = Number(location.lon);
      const padding = 0.01;

      const boundingBox =
        `${lon - padding},${lat - padding},` +
        `${lon + padding},${lat + padding}`;

      map.src =
        "https://www.openstreetmap.org/export/embed.html" +
        `?bbox=${encodeURIComponent(boundingBox)}` +
        `&layer=mapnik&marker=${lat}%2C${lon}`;

      status.textContent = `Map centered on: ${location.display_name}`;
    } catch (error) {
      status.textContent =
        "The map search could not be completed right now. Try again later.";
      console.error("Map search error:", error);
    }
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}
