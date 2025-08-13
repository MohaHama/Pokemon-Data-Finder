let slides = [];
let slideIndex = 0;

document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    fetchData();
});

async function fetchData(){
    const nameInput = document.getElementById("PokemonName").value.trim().toLowerCase();
    if(!nameInput) return;

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nameInput)}`);
    if(!res.ok){ alert("Kunne ikke finde Pokémon"); return; }

    const pokemon = await res.json();
    renderPokemon(pokemon);
}

function renderPokemon(pokemon){
    // Header
    document.getElementById("displayName").textContent = capitalize(pokemon.name);
    document.getElementById("pid").textContent = "#" + String(pokemon.id).padStart(4,"0");

    // Typer
    const typesEl = document.getElementById("types");
    typesEl.innerHTML = pokemon.types
        .map(t => `<span class="badge">${t.type.name}</span>`)
        .join("");

    // Abilities (markér hidden)
    document.getElementById("abilities").innerHTML = pokemon.abilities
        .map(a => prettify(a.ability.name) + (a.is_hidden ? " <em>(hidden)</em>" : ""))
        .join(", ");

    // Højde/vægt
    document.getElementById("height").textContent = (pokemon.height/10).toFixed(1) + " m";
    document.getElementById("weight").textContent = (pokemon.weight/10).toFixed(1) + " kg";

    // Stats
    const labels = { hp:"HP", attack:"ATK", defense:"DEF", "special-attack":"SpA", "special-defense":"SpD", speed:"SPE" };
    const max = 255;
    const statsEl = document.getElementById("stats");
    statsEl.innerHTML = pokemon.stats.map(s => {
        const val = s.base_stat;
        const pct = Math.min(100, Math.round(val / max * 100));
        const name = labels[s.stat.name] || s.stat.name;
        return `
      <div class="stat">
        <span class="stat-name">${name}</span>
        <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
        <span class="stat-value">${val}</span>
      </div>
    `;
    }).join("");

    // Sprites (pænest først)
    const s = pokemon.sprites;
    slides = [
        s?.other?.["official-artwork"]?.front_default,
        s?.other?.home?.front_default,
        s?.front_default,
        s?.back_default,
        s?.front_shiny,
        s?.back_shiny
    ].filter(Boolean);

    slideIndex = 0;
    showSlide(slideIndex, pokemon.name);
}

function showSlide(i, name){
    const img = document.getElementById("PokemonImg");
    if(!slides.length){ img.style.display = "none"; return; }

    const url = slides[i];
    img.src = url;
    img.alt = `${capitalize(name || document.getElementById("displayName").textContent)} sprite ${i+1}/${slides.length}`;
    img.style.display = "block";

    // Gør små sprites “pixelated”, men ikke official-artwork/home
    const isSmallSprite = !(url.includes("official-artwork") || url.includes("home"));
    img.classList.toggle("pixelated", isSmallSprite);

    // class til visning
    img.classList.add("display");
}

function nextSlide(){
    if(!slides.length) return;
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
}
function prevSlide(){
    if(!slides.length) return;
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    showSlide(slideIndex);
}

function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
function prettify(s){ return s.replace(/-/g, " "); }
